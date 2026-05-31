import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import * as zlib from 'zlib';
import * as crypto from 'crypto';

// Transparent compression helper utilizing standard zlib GZIP
function compress(text: string): string {
  if (!text) return text;
  if (text.startsWith('gz:')) return text; // already compressed
  const compressed = zlib.gzipSync(Buffer.from(text, 'utf8'));
  return 'gz:' + compressed.toString('base64');
}

// Transparent decompression helper
function decompress(text: string): string {
  if (!text) return text;
  if (text.startsWith('gz:')) {
    const base64Data = text.slice(3);
    const buffer = Buffer.from(base64Data, 'base64');
    return zlib.gunzipSync(buffer).toString('utf8');
  }
  return text;
}

// Compress complex/long question fields
function compressQuestion(data: any): any {
  if (!data) return data;
  const copy = { ...data };
  if (copy.optionA) copy.optionA = compress(copy.optionA);
  if (copy.optionB) copy.optionB = compress(copy.optionB);
  if (copy.optionC) copy.optionC = compress(copy.optionC);
  if (copy.optionD) copy.optionD = compress(copy.optionD);
  if (copy.solution) copy.solution = compress(copy.solution);
  return copy;
}

// Decompress complex/long question fields
function decompressQuestion(data: any): any {
  if (!data) return data;
  const copy = { ...data };
  if (copy.optionA) copy.optionA = decompress(copy.optionA);
  if (copy.optionB) copy.optionB = decompress(copy.optionB);
  if (copy.optionC) copy.optionC = decompress(copy.optionC);
  if (copy.optionD) copy.optionD = decompress(copy.optionD);
  if (copy.solution) copy.solution = decompress(copy.solution);
  return copy;
}

// Generate deterministic unique code based on normalized question text hash
function generateQuestionCode(text: string): string {
  if (!text) return 'Q-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return 'Q-' + hash.substring(0, 8).toUpperCase();
}

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionDto, userId: string) {
    const code = generateQuestionCode(dto.text);
    
    // Graceful automatic deduplication! If it matches an existing question code, return it.
    const existing = await this.prisma.question.findUnique({
      where: { code },
      include: {
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    if (existing) {
      return decompressQuestion(existing);
    }

    const compressedData = compressQuestion(dto);
    const question = await this.prisma.question.create({
      data: {
        type: compressedData.type,
        text: compressedData.text, // Kept plain text for standard DB contains search queries
        optionA: compressedData.optionA,
        optionB: compressedData.optionB,
        optionC: compressedData.optionC,
        optionD: compressedData.optionD,
        correctAnswer: compressedData.correctAnswer,
        numericalAnswer: compressedData.numericalAnswer,
        difficulty: compressedData.difficulty,
        subjectId: compressedData.subjectId,
        chapterId: compressedData.chapterId,
        topicId: compressedData.topicId,
        solution: compressedData.solution,
        solutionImage: compressedData.solutionImage,
        questionImage: compressedData.questionImage,
        instituteId: compressedData.instituteId,
        createdById: userId,
        source: compressedData.source,
        year: compressedData.year,
        tags: compressedData.tags,
        code, // unique deterministic identifier
      },
      include: {
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return decompressQuestion(question);
  }

  async findAll(filters: {
    subject?: string;
    chapter?: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    search?: string;
    isVerified?: boolean;
    instituteId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.subject) where.subjectId = filters.subject;
    if (filters.chapter) where.chapterId = filters.chapter;
    if (filters.topic) where.topicId = filters.topic;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.type) where.type = filters.type;
    if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
    if (filters.instituteId) where.instituteId = filters.instituteId;
    if (filters.search) {
      where.text = { contains: filters.search };
    }

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          topic: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      questions: questions.map((q) => decompressQuestion(q)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return decompressQuestion(question);
  }

  async update(id: string, dto: UpdateQuestionDto, currentUser: any) {
    const question = await this.prisma.question.findUnique({ where: { id } });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (
      question.createdById !== currentUser.id &&
      !['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('You can only edit your own questions');
    }

    const compressedData = compressQuestion(dto);
    const updated = await this.prisma.question.update({
      where: { id },
      data: compressedData,
      include: {
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return decompressQuestion(updated);
  }

  async remove(id: string, currentUser: any) {
    const question = await this.prisma.question.findUnique({ where: { id } });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (
      question.createdById !== currentUser.id &&
      !['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.question.delete({ where: { id } });
    return { message: 'Question deleted successfully' };
  }

  async bulkCreate(questions: CreateQuestionDto[], userId: string) {
    const results = [];
    for (const dto of questions) {
      const q = await this.create(dto, userId);
      results.push(q);
    }
    return { created: results.length, questions: results };
  }

  async verify(id: string, currentUser: any) {
    if (!['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('Only admins can verify questions');
    }

    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const updated = await this.prisma.question.update({
      where: { id },
      data: { isVerified: true },
    });

    return decompressQuestion(updated);
  }

  async flag(id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const updated = await this.prisma.question.update({
      where: { id },
      data: { flagCount: question.flagCount + 1 },
    });

    return decompressQuestion(updated);
  }

  async getSubjectsAndChapters() {
    return this.prisma.subject.findMany({
      include: {
        chapters: {
          select: { id: true, name: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async clearAll() {
    const deletedAnswers = await this.prisma.answer.deleteMany({});
    const deletedTestQuestions = await this.prisma.testQuestion.deleteMany({});
    const deletedQuestions = await this.prisma.question.deleteMany({});
    return {
      message: 'Question bank cleared successfully!',
      deletedAnswers: deletedAnswers.count,
      deletedTestQuestions: deletedTestQuestions.count,
      deletedQuestions: deletedQuestions.count,
    };
  }
}
