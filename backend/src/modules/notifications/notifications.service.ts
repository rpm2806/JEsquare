import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async createNotification(userId: string, title: string, message: string, type = 'INFO') {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  async createAdminNotification(dto: { studentId: string; title: string; message: string; type?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!user) {
      throw new NotFoundException('Student user not found');
    }

    return this.prisma.notification.create({
      data: {
        userId: dto.studentId,
        title: dto.title,
        message: dto.message,
        type: dto.type || 'SYSTEM',
      },
    });
  }
}
