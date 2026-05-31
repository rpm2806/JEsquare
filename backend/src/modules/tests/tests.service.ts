import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTestDto, userId: string) {
    const test = await this.prisma.test.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        duration: dto.duration || 180,
        totalMarks: dto.totalMarks || 0,
        negativeMarking: dto.negativeMarking || 0,
        shuffleQuestions: dto.shuffleQuestions || false,
        startTime: dto.startTime ? new Date(dto.startTime) : null,
        endTime: dto.endTime ? new Date(dto.endTime) : null,
        instituteId: dto.instituteId,
        createdById: userId,
      },
    });

    // Add questions if provided
    if (dto.questionIds && dto.questionIds.length > 0) {
      let totalMarks = 0;
      for (let i = 0; i < dto.questionIds.length; i++) {
        await this.prisma.testQuestion.create({
          data: {
            testId: test.id,
            questionId: dto.questionIds[i],
            order: i,
          },
        });
        totalMarks += 4; // default marks per question
      }
      await this.prisma.test.update({
        where: { id: test.id },
        data: { totalMarks: dto.totalMarks || totalMarks },
      });
    }

    // Assign batches if provided
    if (dto.batchIds && dto.batchIds.length > 0) {
      for (const batchId of dto.batchIds) {
        await this.prisma.testBatch.create({
          data: { testId: test.id, batchId },
        });
      }
    }

    return this.findOne(test.id);
  }

  async findAll(
    filters: {
      instituteId?: string;
      type?: string;
      isPublished?: boolean;
      createdById?: string;
      page?: number;
      limit?: number;
    },
    userRole?: string,
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.instituteId) where.instituteId = filters.instituteId;
    if (filters.type) where.type = filters.type;
    if (filters.isPublished !== undefined) where.isPublished = filters.isPublished;
    if (filters.createdById) where.createdById = filters.createdById;

    if (userRole === 'STUDENT') {
      where.isPublished = true;
      const tests = await this.prisma.test.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      });
      return {
        tests,
        pagination: {
          total: tests.length,
          page: 1,
          limit: 5,
          totalPages: 1,
        },
      };
    }

    const [tests, total] = await Promise.all([
      this.prisma.test.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      }),
      this.prisma.test.count({ where }),
    ]);

    return {
      tests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        sections: {
          include: {
            questions: {
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
                    difficulty: true,
                    questionImage: true,
                    subject: { select: { id: true, name: true } },
                    chapter: { select: { id: true, name: true } },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        questions: {
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
                difficulty: true,
                questionImage: true,
                subject: { select: { id: true, name: true } },
                chapter: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        testBatches: {
          include: { batch: { select: { id: true, name: true } } },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    return test;
  }

  async update(id: string, dto: UpdateTestDto, currentUser: any) {
    const test = await this.prisma.test.findUnique({ where: { id } });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (
      test.createdById !== currentUser.id &&
      !['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.test.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
    });
  }

  async remove(id: string, currentUser: any) {
    const test = await this.prisma.test.findUnique({ where: { id } });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (
      test.createdById !== currentUser.id &&
      !['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.test.delete({ where: { id } });
    return { message: 'Test deleted successfully' };
  }

  async publish(id: string, currentUser: any) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (
      test.createdById !== currentUser.id &&
      !['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (test._count.questions === 0) {
      throw new BadRequestException('Cannot publish a test with no questions');
    }

    return this.prisma.test.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string, currentUser: any) {
    const test = await this.prisma.test.findUnique({ where: { id } });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (
      test.createdById !== currentUser.id &&
      !['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.test.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}
