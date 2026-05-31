import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private keyId: string;
  private keySecret: string;

  constructor(private prisma: PrismaService) {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  async createOrder(planId: string, amount: number) {
    // If Razorpay credentials are not configured, return a beautiful mock order!
    if (!this.keyId || !this.keySecret) {
      return {
        id: `mock_order_${Math.random().toString(36).substring(2, 10)}`,
        amount: amount * 100, // paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        isMock: true,
      };
    }

    try {
      const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // in paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error?.description || 'Razorpay order creation failed');
      }

      return {
        ...orderData,
        isMock: false,
      };
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Razorpay order creation failed');
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    if (orderId.startsWith('mock_order_') || !this.keyId || !this.keySecret) {
      // Mock validation succeeds automatically
      return true;
    }

    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new BadRequestException('Payment signature verification failed. Secure tampering detected.');
    }

    return true;
  }
}
