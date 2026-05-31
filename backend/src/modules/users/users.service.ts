import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          roleConfirmed: true,
          balance: true,
          phone: true,
          avatar: true,
          isActive: true,
          instituteId: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleConfirmed: true,
        balance: true,
        phone: true,
        avatar: true,
        isActive: true,
        instituteId: true,
        institute: {
          select: { id: true, name: true, slug: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, dto: UpdateUserDto, currentUser: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only admins can update other users or change roles
    if (currentUser.id !== id && !['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Only SUPER_ADMIN can change roles
    if (dto.role && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can change user roles');
    }

    // Non-admins can only update their own name, phone, avatar
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;

    if (['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUser.role)) {
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
      if (dto.role !== undefined) updateData.role = dto.role;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleConfirmed: true,
        balance: true,
        phone: true,
        avatar: true,
        isActive: true,
        instituteId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.id !== id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Soft delete: deactivate instead of hard delete
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  async selectRole(id: string, role: string, currentUser: any) {
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own role selection');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.roleConfirmed) {
      throw new ForbiddenException('Role has already been selected and locked. To change it, please email the admin.');
    }
    if (!['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN'].includes(role)) {
      throw new ForbiddenException('Invalid role selection. Must be STUDENT, TEACHER, or INSTITUTE_ADMIN.');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        role,
        roleConfirmed: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleConfirmed: true,
        balance: true,
        phone: true,
        avatar: true,
        isActive: true,
        instituteId: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.current, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect current password');
    }

    if (!dto.newPassword || dto.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    if (dto.newPassword !== dto.confirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async getMe(userId: string) {
    return this.findOne(userId);
  }

  async addBalance(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance + amount },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
      },
    });
  }
}
