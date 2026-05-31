import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class InstitutesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInstituteDto, userId: string) {
    // Check if user already owns an institute
    const existing = await this.prisma.institute.findUnique({
      where: { ownerId: userId },
    });
    if (existing) {
      throw new ConflictException('You already own an institute');
    }

    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const slugExists = await this.prisma.institute.findUnique({
      where: { slug },
    });

    const finalSlug = slugExists ? `${slug}-${Date.now()}` : slug;

    const institute = await this.prisma.institute.create({
      data: {
        name: dto.name,
        slug: finalSlug,
        logo: dto.logo,
        domain: dto.domain,
        brandPrimaryColor: dto.brandPrimaryColor,
        brandSecondaryColor: dto.brandSecondaryColor,
        address: dto.address,
        phone: dto.phone,
        website: dto.website,
        ownerId: userId,
      },
    });

    // Update user role to INSTITUTE_ADMIN and link to institute
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'INSTITUTE_ADMIN', instituteId: institute.id },
    });

    return institute;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [institutes, total] = await Promise.all([
      this.prisma.institute.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { members: true, batches: true } },
        },
      }),
      this.prisma.institute.count(),
    ]);

    return {
      institutes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const institute = await this.prisma.institute.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        batches: true,
        _count: { select: { members: true, batches: true, questions: true, tests: true } },
      },
    });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    return institute;
  }

  async update(id: string, dto: UpdateInstituteDto, currentUser: any) {
    const institute = await this.prisma.institute.findUnique({ where: { id } });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    if (
      institute.ownerId !== currentUser.id &&
      currentUser.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Only the owner or super admin can update this institute');
    }

    return this.prisma.institute.update({
      where: { id },
      data: dto,
    });
  }

  // Batch management
  async createBatch(instituteId: string, dto: CreateBatchDto, currentUser: any) {
    const institute = await this.prisma.institute.findUnique({
      where: { id: instituteId },
    });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    if (
      institute.ownerId !== currentUser.id &&
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.instituteId !== instituteId
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.batch.create({
      data: {
        name: dto.name,
        description: dto.description,
        instituteId,
      },
    });
  }

  async getBatches(instituteId: string) {
    const institute = await this.prisma.institute.findUnique({
      where: { id: instituteId },
    });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    return this.prisma.batch.findMany({
      where: { instituteId },
      include: {
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Member management
  async addMember(instituteId: string, dto: AddMemberDto, currentUser: any) {
    const institute = await this.prisma.institute.findUnique({
      where: { id: instituteId },
    });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    if (
      institute.ownerId !== currentUser.id &&
      currentUser.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Only the owner or super admin can add members');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.instituteId) {
      throw new ConflictException('User already belongs to an institute');
    }

    return this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        instituteId,
        role: dto.role || user.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
      },
    });
  }

  async getInstituteActivity(instituteId: string) {
    const [questions, tests, students, attempts] = await Promise.all([
      this.prisma.question.findMany({
        where: { instituteId },
        select: { id: true, text: true, createdAt: true, subject: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.test.findMany({
        where: { instituteId },
        select: { id: true, title: true, createdAt: true, type: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.user.findMany({
        where: { instituteId, role: 'STUDENT' },
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.attempt.findMany({
        where: { test: { instituteId }, NOT: { status: 'IN_PROGRESS' } },
        select: {
          id: true,
          score: true,
          submittedAt: true,
          student: { select: { name: true } },
          test: { select: { title: true, totalMarks: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 10,
      }),
    ]);

    const activities: any[] = [];

    questions.forEach((q) => {
      activities.push({
        type: 'QUESTION_UPLOAD',
        message: `New question added in ${q.subject?.name || 'JEE Syllabus'}: "${q.text.substring(0, 60)}..."`,
        date: q.createdAt,
      });
    });

    tests.forEach((t) => {
      activities.push({
        type: 'TEST_CREATE',
        message: `New Mock Test generated: "${t.title}" (${t.type.replace(/_/g, ' ')})`,
        date: t.createdAt,
      });
    });

    students.forEach((s) => {
      activities.push({
        type: 'STUDENT_ENROLL',
        message: `Student "${s.name}" enrolled into practice cohort.`,
        date: s.createdAt,
      });
    });

    attempts.forEach((a) => {
      activities.push({
        type: 'TEST_ATTEMPT',
        message: `Student "${a.student?.name || 'Anonymous'}" scored ${a.score}/${a.test?.totalMarks || 300} on "${a.test?.title}".`,
        date: a.submittedAt || new Date(),
      });
    });

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return activities.slice(0, 10);
  }
}
