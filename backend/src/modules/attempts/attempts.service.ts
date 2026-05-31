import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { AntiCheatEventDto } from './dto/anti-cheat-event.dto';

@Injectable()
export class AttemptsService {
  private readonly logger = new Logger(AttemptsService.name);

  constructor(private prisma: PrismaService) {}

  async startAttempt(testId: string, studentId: string) {
    // Check if test exists and is published
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        _count: { select: { questions: true } },
        createdBy: { select: { role: true } },
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (!test.isPublished) {
      throw new BadRequestException('Test is not published');
    }

    // Check time window
    const now = new Date();
    if (test.startTime && now < test.startTime) {
      throw new BadRequestException('Test has not started yet');
    }
    if (test.endTime && now > test.endTime) {
      throw new BadRequestException('Test has ended');
    }

    // Check if attempt is currently IN_PROGRESS
    const existing = await this.prisma.attempt.findFirst({
      where: {
        testId,
        studentId,
        status: 'IN_PROGRESS',
      },
    });

    if (existing) {
      return this.getAttemptWithAnswers(existing.id);
    }

    // Enforce 100 student limit for Teacher and Institute tests
    if (test.createdBy?.role === 'TEACHER' || test.createdBy?.role === 'INSTITUTE_ADMIN') {
      const studentCount = await this.prisma.attempt.count({
        where: { testId },
      });
      if (studentCount >= 100) {
        throw new ForbiddenException(
          'This test has reached its maximum limit of 100 students.',
        );
      }
    }

    // Create attempt
    const attempt = await this.prisma.attempt.create({
      data: {
        testId,
        studentId,
        status: 'IN_PROGRESS',
      },
    });

    return this.getAttemptWithAnswers(attempt.id);
  }

  async saveAnswer(attemptId: string, dto: SaveAnswerDto, studentId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.studentId !== studentId) {
      throw new ForbiddenException('This is not your attempt');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Attempt is already submitted');
    }

    // Upsert the answer
    const existingAnswer = await this.prisma.answer.findUnique({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: dto.questionId,
        },
      },
    });

    if (existingAnswer) {
      return this.prisma.answer.update({
        where: { id: existingAnswer.id },
        data: {
          selectedOption: dto.selectedOption,
          numericalAnswer: dto.numericalAnswer,
          timeTaken: dto.timeTaken,
          isMarkedForReview: dto.isMarkedForReview,
          isVisited: dto.isVisited ?? true,
          answeredAt: new Date(),
        },
      });
    }

    return this.prisma.answer.create({
      data: {
        attemptId,
        questionId: dto.questionId,
        selectedOption: dto.selectedOption,
        numericalAnswer: dto.numericalAnswer,
        timeTaken: dto.timeTaken,
        isMarkedForReview: dto.isMarkedForReview ?? false,
        isVisited: dto.isVisited ?? true,
        answeredAt: new Date(),
      },
    });
  }

  async submitAttempt(attemptId: string, studentId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: {
              include: { question: true },
            },
            sections: true,
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.studentId !== studentId) {
      throw new ForbiddenException('This is not your attempt');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Attempt is already submitted');
    }

    // Calculate score
    const result = await this.calculateScore(attempt);

    // Update attempt
    const updated = await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'EVALUATED',
        submittedAt: new Date(),
        score: result.score,
        totalCorrect: result.totalCorrect,
        totalWrong: result.totalWrong,
        totalSkipped: result.totalSkipped,
        totalAttempted: result.totalAttempted,
        timeTaken: Math.round(
          (new Date().getTime() - attempt.startedAt.getTime()) / 1000,
        ),
      },
    });

    return updated;
  }

  private async calculateScore(attempt: any) {
    const testQuestions = attempt.test.questions;
    const answers = attempt.answers;
    const sections = attempt.test.sections;

    let score = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalSkipped = 0;
    let totalAttempted = 0;

    // Build a section map for marks
    const sectionMap = new Map<string, any>();
    for (const s of sections) {
      sectionMap.set(s.id, s);
    }

    for (const tq of testQuestions) {
      const question = tq.question;
      const answer = answers.find((a: any) => a.questionId === question.id);

      // Determine marks for this question
      const section = tq.sectionId ? sectionMap.get(tq.sectionId) : null;
      const marksPerQuestion = section?.marksPerQuestion || 4;
      const negativeMarks = section?.negativeMarksPerQuestion || attempt.test.negativeMarking || 1;

      if (!answer || (!answer.selectedOption && answer.numericalAnswer === null)) {
        totalSkipped++;
        // Update answer as skipped
        if (answer) {
          await this.prisma.answer.update({
            where: { id: answer.id },
            data: { isCorrect: null, marksAwarded: 0 },
          });
        }
        continue;
      }

      totalAttempted++;
      let isCorrect = false;

      if (question.type === 'MCQ') {
        isCorrect = answer.selectedOption === question.correctAnswer;
      } else if (question.type === 'MULTI_CORRECT') {
        // Compare sorted comma-separated values
        const studentAnswers = (answer.selectedOption || '')
          .split(',')
          .map((s: string) => s.trim())
          .sort()
          .join(',');
        const correctAnswers = question.correctAnswer
          .split(',')
          .map((s: string) => s.trim())
          .sort()
          .join(',');
        isCorrect = studentAnswers === correctAnswers;
      } else if (question.type === 'NUMERICAL') {
        const tolerance = 0.01;
        const correctNum = question.numericalAnswer;
        const studentNum = answer.numericalAnswer;
        if (correctNum !== null && studentNum !== null) {
          isCorrect = Math.abs(correctNum - studentNum) <= tolerance;
        }
      }

      const marksAwarded = isCorrect ? marksPerQuestion : -negativeMarks;
      score += marksAwarded;

      if (isCorrect) {
        totalCorrect++;
      } else {
        totalWrong++;
      }

      // Update individual answer
      await this.prisma.answer.update({
        where: { id: answer.id },
        data: { isCorrect, marksAwarded },
      });
    }

    return { score, totalCorrect, totalWrong, totalSkipped, totalAttempted };
  }

  async getAttemptWithAnswers(attemptId: string) {
    const attemptBase = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      select: { status: true },
    });

    if (!attemptBase) {
      throw new NotFoundException('Attempt not found');
    }

    const isCompleted = attemptBase.status !== 'IN_PROGRESS';

    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            duration: true,
            totalMarks: true,
            type: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                type: true,
                text: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                questionImage: true,
                correctAnswer: isCompleted,
                numericalAnswer: isCompleted,
                solution: isCompleted,
                subject: { select: { id: true, name: true } },
                chapter: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return attempt;
  }

  async getMyAttempts(studentId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      this.prisma.attempt.findMany({
        where: { studentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          test: {
            select: {
              id: true,
              title: true,
              type: true,
              totalMarks: true,
              duration: true,
            },
          },
        },
      }),
      this.prisma.attempt.count({ where: { studentId } }),
    ]);

    return {
      attempts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async logAntiCheatEvent(
    attemptId: string,
    dto: AntiCheatEventDto,
    studentId: string,
  ) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.studentId !== studentId) {
      throw new ForbiddenException('This is not your attempt');
    }

    return this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        tabSwitchCount: { increment: dto.tabSwitches || 0 },
        copyPasteCount: { increment: dto.copyPasteEvents || 0 },
      },
    });
  }
}
