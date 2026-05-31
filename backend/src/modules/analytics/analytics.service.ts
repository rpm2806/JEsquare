import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStudentPerformance(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const attempts = await this.prisma.attempt.findMany({
      where: { studentId, status: 'EVALUATED' },
      include: {
        test: {
          select: { id: true, title: true, type: true, totalMarks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalTests = attempts.length;
    const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const avgScore = totalTests > 0 ? totalScore / totalTests : 0;
    const avgPercentage =
      totalTests > 0
        ? attempts.reduce((sum, a) => {
            const pct = a.test.totalMarks > 0
              ? ((a.score || 0) / a.test.totalMarks) * 100
              : 0;
            return sum + pct;
          }, 0) / totalTests
        : 0;
    const bestScore = totalTests > 0
      ? Math.max(...attempts.map((a) => a.score || 0))
      : 0;

    // Accuracy
    const totalCorrect = attempts.reduce((sum, a) => sum + (a.totalCorrect || 0), 0);
    const totalAttempted = attempts.reduce((sum, a) => sum + (a.totalAttempted || 0), 0);
    const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    return {
      student,
      summary: {
        totalTests,
        avgScore: Math.round(avgScore * 100) / 100,
        avgPercentage: Math.round(avgPercentage * 100) / 100,
        bestScore,
        accuracy: Math.round(accuracy * 100) / 100,
        totalCorrect,
        totalAttempted,
      },
      recentAttempts: attempts.slice(0, 10).map((a) => ({
        attemptId: a.id,
        testId: a.test.id,
        testTitle: a.test.title,
        testType: a.test.type,
        score: a.score,
        totalMarks: a.test.totalMarks,
        percentage:
          a.test.totalMarks > 0
            ? Math.round(((a.score || 0) / a.test.totalMarks) * 100 * 100) / 100
            : 0,
        totalCorrect: a.totalCorrect,
        totalWrong: a.totalWrong,
        totalSkipped: a.totalSkipped,
        timeTaken: a.timeTaken,
        date: a.submittedAt,
      })),
    };
  }

  async getWeakChapters(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all answers by this student
    const answers = await this.prisma.answer.findMany({
      where: {
        attempt: { studentId, status: 'EVALUATED' },
      },
      include: {
        question: {
          include: {
            subject: { select: { id: true, name: true } },
            chapter: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Aggregate by chapter
    const chapterStats = new Map<
      string,
      {
        chapterId: string;
        chapterName: string;
        subjectName: string;
        total: number;
        correct: number;
        wrong: number;
        skipped: number;
      }
    >();

    for (const answer of answers) {
      const key = answer.question.chapterId;
      if (!chapterStats.has(key)) {
        chapterStats.set(key, {
          chapterId: answer.question.chapter.id,
          chapterName: answer.question.chapter.name,
          subjectName: answer.question.subject.name,
          total: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
        });
      }

      const stats = chapterStats.get(key)!;
      stats.total++;

      if (answer.isCorrect === true) {
        stats.correct++;
      } else if (answer.isCorrect === false) {
        stats.wrong++;
      } else {
        stats.skipped++;
      }
    }

    // Calculate accuracy and sort by weakness
    const chapters = Array.from(chapterStats.values())
      .map((ch) => ({
        ...ch,
        accuracy: ch.total > 0 ? Math.round((ch.correct / ch.total) * 100 * 100) / 100 : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    return {
      weakChapters: chapters.filter((c) => c.accuracy < 50),
      allChapters: chapters,
    };
  }

  async getInstituteAnalytics(instituteId: string) {
    const institute = await this.prisma.institute.findUnique({
      where: { id: instituteId },
    });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    const [
      totalStudents,
      totalTeachers,
      totalTests,
      totalQuestions,
      totalAttempts,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { instituteId, role: 'STUDENT' },
      }),
      this.prisma.user.count({
        where: { instituteId, role: 'TEACHER' },
      }),
      this.prisma.test.count({
        where: { instituteId },
      }),
      this.prisma.question.count({
        where: { instituteId },
      }),
      this.prisma.attempt.count({
        where: {
          test: { instituteId },
          status: 'EVALUATED',
        },
      }),
    ]);

    // Average score across all attempts
    const attempts = await this.prisma.attempt.findMany({
      where: {
        test: { instituteId },
        status: 'EVALUATED',
      },
      select: { score: true, totalCorrect: true, totalAttempted: true },
    });

    const avgScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
        : 0;

    return {
      institute: { id: institute.id, name: institute.name },
      stats: {
        totalStudents,
        totalTeachers,
        totalTests,
        totalQuestions,
        totalAttempts,
        avgScore: Math.round(avgScore * 100) / 100,
      },
    };
  }

  async getTestAnalytics(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { id: true, title: true, totalMarks: true, type: true },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const attempts = await this.prisma.attempt.findMany({
      where: { testId, status: 'EVALUATED' },
      include: {
        student: { select: { id: true, name: true } },
      },
      orderBy: { score: 'desc' },
    });

    const scores = attempts.map((a) => a.score || 0);
    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0
      ? scores.reduce((a, b) => a + b, 0) / totalAttempts
      : 0;
    const maxScore = totalAttempts > 0 ? Math.max(...scores) : 0;
    const minScore = totalAttempts > 0 ? Math.min(...scores) : 0;
    const medianScore = totalAttempts > 0
      ? scores.sort((a, b) => a - b)[Math.floor(totalAttempts / 2)]
      : 0;

    // Score distribution buckets
    const distribution = {
      '0-20%': 0,
      '20-40%': 0,
      '40-60%': 0,
      '60-80%': 0,
      '80-100%': 0,
    };

    for (const score of scores) {
      const pct = test.totalMarks > 0 ? (score / test.totalMarks) * 100 : 0;
      if (pct < 20) distribution['0-20%']++;
      else if (pct < 40) distribution['20-40%']++;
      else if (pct < 60) distribution['40-60%']++;
      else if (pct < 80) distribution['60-80%']++;
      else distribution['80-100%']++;
    }

    return {
      test,
      stats: {
        totalAttempts,
        avgScore: Math.round(avgScore * 100) / 100,
        maxScore,
        minScore,
        medianScore,
        avgPercentage: test.totalMarks > 0
          ? Math.round((avgScore / test.totalMarks) * 100 * 100) / 100
          : 0,
      },
      distribution,
    };
  }

  async getLeaderboard(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { id: true, title: true, totalMarks: true },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const attempts = await this.prisma.attempt.findMany({
      where: { testId, status: 'EVALUATED' },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Deduplicate by studentId, keeping only the first (oldest) attempt
    const firstAttemptsMap = new Map<string, typeof attempts[0]>();
    for (const a of attempts) {
      if (!firstAttemptsMap.has(a.studentId)) {
        firstAttemptsMap.set(a.studentId, a);
      }
    }

    const firstAttempts = Array.from(firstAttemptsMap.values());

    // Sort by score DESC, then timeTaken ASC
    firstAttempts.sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      const timeA = a.timeTaken ?? 0;
      const timeB = b.timeTaken ?? 0;
      return timeA - timeB;
    });

    return {
      test,
      leaderboard: firstAttempts.map((a, index) => ({
        rank: index + 1,
        student: a.student,
        score: a.score,
        totalMarks: test.totalMarks,
        percentage: test.totalMarks > 0
          ? Math.round(((a.score || 0) / test.totalMarks) * 100 * 100) / 100
          : 0,
        totalCorrect: a.totalCorrect,
        totalWrong: a.totalWrong,
        totalSkipped: a.totalSkipped,
        timeTaken: a.timeTaken,
      })),
    };
  }

  async getSuperAdminAnalytics() {
    const [
      totalStudents,
      activeAttempts,
      totalRevenueCollected,
    ] = await Promise.all([
      // 1. Total registered student count
      this.prisma.user.count({
        where: { role: 'STUDENT' },
      }),
      // 2. Active mock test attempts count
      this.prisma.attempt.count({
        where: { status: 'IN_PROGRESS' },
      }),
      // 3. Revenue collected (sum of all subscriptions + simulated payments)
      this.prisma.subscription.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      totalStudents,
      activeAttempts,
      totalRevenue: totalRevenueCollected._sum.amount || 0,
    };
  }

  async getGlobalLeaderboard() {
    const topAttempts = await this.prisma.attempt.findMany({
      where: { status: 'EVALUATED' },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        test: { select: { title: true, totalMarks: true } },
      },
      orderBy: { score: 'desc' },
      take: 10,
    });

    return topAttempts.map((a, i) => ({
      rank: i + 1,
      studentName: a.student.name,
      studentEmail: a.student.email,
      studentAvatar: a.student.avatar,
      score: a.score || 0,
      totalMarks: a.test.totalMarks || 100,
      percentile: a.test.totalMarks > 0 ? Math.round(((a.score || 0) / a.test.totalMarks) * 100 * 10) / 10 : 0,
      testTitle: a.test.title,
    }));
  }
}
