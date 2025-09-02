import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createPaymentIntent(userId: string, createPaymentDto: CreatePaymentIntentDto) {
    const { amount, currency = 'usd', passType, plazaId } = createPaymentDto;
    
    // Calculate validity dates
    const now = new Date();
    const validFrom = now.toISOString();
    const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // +24h
    
    // Create payment intent with Stripe
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      currency,
      {
        userId,
        passType,
        plazaId,
        validFrom,
        validUntil,
      }
    );

    // Create transaction record
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency,
        status: 'PENDING',
        paymentMethod: 'stripe',
        stripePaymentId: paymentIntent.id,
        description: `${passType} pass for plaza ${plazaId}`,
        metadata: {
          passType,
          plazaId,
          validFrom,
          validUntil,
        },
      },
    });

    return {
      paymentIntent,
      transactionId: transaction.id,
    };
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto) {
    const { paymentIntentId, transactionId } = confirmPaymentDto;
    
    // Confirm payment with Stripe
    const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update transaction status
      const transaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          stripeChargeId: paymentIntent.id,
        },
      });

      return {
        success: true,
        transaction,
        paymentIntent,
      };
    }

    return {
      success: false,
      status: paymentIntent.status,
    };
  }

  async getPaymentHistory(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return transactions;
  }
}
