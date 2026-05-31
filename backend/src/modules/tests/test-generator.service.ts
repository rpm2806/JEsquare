import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateTestDto, SectionConfig } from './dto/generate-test.dto';

@Injectable()
export class JEsquareeratorService {
  private readonly logger = new Logger(JEsquareeratorService.name);

  constructor(private prisma: PrismaService) {}

  async generateTest(dto: GenerateTestDto, userId: string) {
    this.logger.log(`Generating test: ${dto.title} with ${dto.sections.length} sections`);

    // Create the test
    const test = await this.prisma.test.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        duration: dto.duration || 180,
        createdById: userId,
        instituteId: dto.instituteId,
        isPublished: true, // Instantly publish generated tests for immediate student attempts
      },
    });

    let totalMarks = 0;
    let questionOrder = 0;
    const allSelectedQuestionIds = new Set<string>();

    for (let i = 0; i < dto.sections.length; i++) {
      const sectionConfig = dto.sections[i];

      // Create the test section
      const section = await this.prisma.testSection.create({
        data: {
          testId: test.id,
          name: sectionConfig.name,
          order: i,
          marksPerQuestion: sectionConfig.marksPerQuestion || 4,
          negativeMarksPerQuestion: sectionConfig.negativeMarksPerQuestion || 1,
          maxQuestions: sectionConfig.questionCount,
        },
      });

      // Select questions for this section
      const questions = await this.selectQuestionsForSection(
        sectionConfig,
        allSelectedQuestionIds,
      );

      if (questions.length < sectionConfig.questionCount) {
        this.logger.warn(
          `Section "${sectionConfig.name}": requested ${sectionConfig.questionCount} questions, found ${questions.length}`,
        );
      }

      // Create TestQuestion records
      for (const question of questions) {
        await this.prisma.testQuestion.create({
          data: {
            testId: test.id,
            sectionId: section.id,
            questionId: question.id,
            order: questionOrder++,
          },
        });
        allSelectedQuestionIds.add(question.id);
        totalMarks += sectionConfig.marksPerQuestion || 4;
      }
    }

    // Update total marks
    await this.prisma.test.update({
      where: { id: test.id },
      data: { totalMarks },
    });

    // Fetch the complete test
    return this.prisma.test.findUnique({
      where: { id: test.id },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                question: {
                  select: {
                    id: true,
                    type: true,
                    text: true,
                    difficulty: true,
                    subject: { select: { name: true } },
                    chapter: { select: { name: true } },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  private async selectQuestionsForSection(
    config: SectionConfig,
    excludeIds: Set<string>,
  ) {
    const distribution = config.difficultyDistribution || {
      easy: 30,
      medium: 50,
      hard: 20,
    };

    const totalNeeded = config.questionCount;
    const easyCount = Math.round((distribution.easy / 100) * totalNeeded);
    const hardCount = Math.round((distribution.hard / 100) * totalNeeded);
    const mediumCount = totalNeeded - easyCount - hardCount;

    const selectedQuestions: any[] = [];

    // Fetch questions by difficulty
    for (const [difficulty, count] of [
      ['EASY', easyCount],
      ['MEDIUM', mediumCount],
      ['HARD', hardCount],
    ] as [string, number][]) {
      if (count <= 0) continue;

      const where: any = {
        subjectId: config.subjectId,
        difficulty,
        id: { notIn: Array.from(excludeIds) },
      };

      if (config.chapterIds && config.chapterIds.length > 0) {
        where.chapterId = { in: config.chapterIds };
      }

      const availableQuestions = await this.prisma.question.findMany({
        where,
      });

      // Weighted random selection (shuffle and pick)
      const shuffled = this.shuffleArray([...availableQuestions]);
      const picked = shuffled.slice(0, count);

      selectedQuestions.push(...picked);
      picked.forEach((q) => excludeIds.add(q.id));
    }

    return selectedQuestions;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
