import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

interface PlanDetails {
  name: string;
  price: number;
  features: string[];
  maxStudents: number;
  maxTests: number;
  durationDays: number;
}

const PLANS: Record<string, PlanDetails> = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['Up to 50 students', 'Up to 10 tests/month', 'Basic analytics'],
    maxStudents: 50,
    maxTests: 10,
    durationDays: 365,
  },
  BASIC: {
    name: 'Basic',
    price: 999,
    features: [
      'Up to 200 students',
      'Up to 50 tests/month',
      'Advanced analytics',
      'PDF generation',
      'Email support',
    ],
    maxStudents: 200,
    maxTests: 50,
    durationDays: 30,
  },
  PRO: {
    name: 'Pro',
    price: 2999,
    features: [
      'Up to 1000 students',
      'Unlimited tests',
      'AI test generation',
      'Full analytics',
      'Doubt marketplace',
      'Priority support',
      'Custom branding',
    ],
    maxStudents: 1000,
    maxTests: -1,
    durationDays: 30,
  },
  INSTITUTE: {
    name: 'Institute',
    price: 9999,
    features: [
      'Unlimited students',
      'Unlimited tests',
      'AI test generation',
      'Full analytics',
      'Doubt marketplace',
      'OCR question import',
      'Dedicated support',
      'Custom branding',
      'API access',
      'White-label option',
    ],
    maxStudents: -1,
    maxTests: -1,
    durationDays: 30,
  },
};

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  getPlans() {
    return Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      ...plan,
      currency: 'INR',
    }));
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    const plan = PLANS[dto.plan];
    if (!plan) {
      throw new BadRequestException('Invalid plan');
    }

    const institute = await this.prisma.institute.findUnique({
      where: { id: dto.instituteId },
    });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Create subscription record
    const subscription = await this.prisma.subscription.create({
      data: {
        instituteId: dto.instituteId,
        plan: dto.plan,
        amount: plan.price,
        currency: 'INR',
        startDate,
        endDate,
        status: 'ACTIVE',
        paymentId: dto.paymentId || `mock_${Date.now()}`,
        features: JSON.stringify(plan.features),
      },
    });

    // Update institute subscription
    await this.prisma.institute.update({
      where: { id: dto.instituteId },
      data: {
        subscriptionPlan: dto.plan,
        subscriptionExpiry: endDate,
      },
    });

    return subscription;
  }

  async getSubscription(instituteId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { instituteId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return {
        plan: 'FREE',
        status: 'ACTIVE',
        features: PLANS.FREE.features,
      };
    }

    return {
      ...subscription,
      features: subscription.features
        ? JSON.parse(subscription.features)
        : [],
    };
  }

  async cancelSubscription(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Subscription is not active');
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Reset institute to free
    if (subscription.instituteId) {
      await this.prisma.institute.update({
        where: { id: subscription.instituteId },
        data: {
          subscriptionPlan: 'FREE',
          subscriptionExpiry: null,
        },
      });
    }

    return updated;
  }
}
