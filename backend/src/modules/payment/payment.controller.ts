import { Controller, Post, Body, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Razorpay order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() dto: { planId?: string; amount: number }) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    return this.paymentService.createOrder(dto.planId || 'CUSTOM', dto.amount);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay subscription payment and upgrade plan' })
  @ApiResponse({ status: 200, description: 'Payment verified and plan upgraded' })
  async verifyPayment(
    @Body() dto: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      planId: string;
      instituteId: string;
    },
  ) {
    // 1. Verify Razorpay secure signature
    await this.paymentService.verifyPayment(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );

    // 2. Validate institute
    const institute = await this.prisma.institute.findUnique({
      where: { id: dto.instituteId },
    });
    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    const plansPriceMap: Record<string, number> = {
      BASIC: 999,
      PRO: 2999,
      INSTITUTE: 9999,
    };
    const price = plansPriceMap[dto.planId] || 0;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days active plan

    // 3. Create active subscription record
    const subscription = await this.prisma.subscription.create({
      data: {
        instituteId: dto.instituteId,
        plan: dto.planId,
        amount: price,
        currency: 'INR',
        startDate,
        endDate,
        status: 'ACTIVE',
        paymentId: dto.razorpay_payment_id,
        features: JSON.stringify(['Paid Tier Upgrade']),
      },
    });

    // 4. Update the institute plan
    await this.prisma.institute.update({
      where: { id: dto.instituteId },
      data: {
        subscriptionPlan: dto.planId,
        subscriptionExpiry: endDate,
      },
    });

    return {
      message: 'Payment verified and subscription activated successfully',
      subscription,
    };
  }

  @Post('verify-student')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay student credit payment and add balance' })
  @ApiResponse({ status: 200, description: 'Student balance updated successfully' })
  async verifyStudentPayment(
    @Body() dto: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      userId: string;
      amount: number;
    },
  ) {
    // 1. Verify Razorpay secure signature
    await this.paymentService.verifyPayment(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );

    // 2. Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Credit the balance directly in database!
    const updatedUser = await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        balance: user.balance + dto.amount,
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        role: true,
      },
    });

    return {
      message: `Successfully credited ₹${dto.amount} to your account balance`,
      user: updatedUser,
    };
  }
}
