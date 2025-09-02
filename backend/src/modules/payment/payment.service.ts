import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto, RefundPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createPaymentIntent(userId: string, createPaymentDto: CreatePaymentIntentDto) {
    const { orderId, provider, currency = 'MXN', metadata } = createPaymentDto;
    
    // Get order details
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        buyerUser: true,
        buyerOrg: true,
        sellerOrg: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify user can pay for this order
    const canPay = 
      order.buyerUserId === userId ||
      (order.buyerOrg && await this.userBelongsToOrg(userId, order.buyerOrg.id));

    if (!canPay) {
      throw new BadRequestException('Not authorized to pay for this order');
    }

    // Check if order is already paid
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    const amount = Number(order.total);
    
    let paymentIntent: any;
    
    switch (provider) {
      case 'STRIPE':
        paymentIntent = await this.stripeService.createPaymentIntent(
          amount * 100, // Stripe expects cents
          currency.toLowerCase(),
          {
            userId,
            orderId,
            ...metadata,
          }
        );
        break;
        
      case 'PAYPAL':
        // TODO: Implement PayPal integration
        paymentIntent = await this.createPayPalOrder(amount, currency, { userId, orderId, ...metadata });
        break;
        
      case 'SPEI':
        // TODO: Implement SPEI integration for Mexico
        paymentIntent = await this.createSPEIInstruction(amount, currency, { userId, orderId, ...metadata });
        break;
        
      case 'PIX':
        // TODO: Implement PIX integration for Brazil
        paymentIntent = await this.createPIXInstruction(amount, currency, { userId, orderId, ...metadata });
        break;
        
      default:
        throw new BadRequestException(`Unsupported payment provider: ${provider}`);
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        provider,
        intentId: paymentIntent.id,
        amount,
        currency,
        net: amount, // Will be updated when fees are calculated
        metadata: {
          userId,
          ...metadata,
        },
      },
    });

    return {
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id,
      amount,
      currency,
      provider,
    };
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto, userId: string) {
    const { paymentIntentId, provider, paymentMethodId } = confirmPaymentDto;

    // Find payment record
    const payment = await this.prisma.payment.findFirst({
      where: { 
        intentId: paymentIntentId,
        provider,
      },
      include: {
        order: {
          include: {
            items: true,
            sellerOrg: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    let result: any;

    switch (provider) {
      case 'STRIPE':
        result = await this.stripeService.confirmPaymentIntent(paymentIntentId);
        break;
        
      case 'PAYPAL':
        // TODO: Implement PayPal confirmation
        result = await this.confirmPayPalOrder(paymentIntentId);
        break;
        
      default:
        throw new BadRequestException(`Payment confirmation not supported for provider: ${provider}`);
    }

    if (result.status === 'succeeded') {
      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          capturedAt: new Date(),
          // Calculate fees based on provider
          fee: this.calculateFee(Number(payment.amount), provider, payment.order.sellerOrg.subscriptionPlan),
        },
      });

      // Update order payment status
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'PAID' },
      });

      // Create commission record
      await this.createCommission(payment.order);

      return {
        success: true,
        paymentId: payment.id,
        status: 'succeeded',
      };
    }

    return {
      success: false,
      status: result.status,
      error: result.error,
    };
  }

  async getPaymentHistory(userId: string, userRole: string) {
    let where: any = {};

    if (userRole === 'CLIENT') {
      // For clients, show payments for orders they made
      where = {
        order: {
          buyerUserId: userId,
        },
      };
    } else if (userRole === 'PROVIDER' || userRole === 'DISTRIBUTOR') {
      // For providers/distributors, show payments for orders they sold
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      where = {
        order: {
          sellerOrgId: user?.orgId,
        },
      };
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  include: { product: true },
                },
              },
            },
            buyerUser: true,
            buyerOrg: true,
            sellerOrg: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return payments;
  }

  private async userBelongsToOrg(userId: string, orgId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.orgId === orgId;
  }

  private calculateFee(amount: number, provider: string, subscriptionPlan: string): number {
    // Fee calculation based on provider and subscription plan
    let baseRate = 0.035; // 3.5% default
    
    switch (provider) {
      case 'STRIPE':
        baseRate = 0.035; // 3.5% + fixed fee
        break;
      case 'PAYPAL':
        baseRate = 0.04; // 4%
        break;
      case 'SPEI':
        baseRate = 0.02; // 2%
        break;
      case 'PIX':
        baseRate = 0.025; // 2.5%
        break;
    }

    // Subscription plan discounts
    switch (subscriptionPlan) {
      case 'PRO':
        baseRate *= 0.9; // 10% discount
        break;
      case 'ELITE':
        baseRate *= 0.8; // 20% discount
        break;
    }

    return Math.round(amount * baseRate * 100) / 100; // Round to 2 decimals
  }

  private async createCommission(order: any) {
    const commissionRate = order.type === 'B2B' ? 0.02 : 0.035; // 2% for B2B, 3.5% for B2C
    const commissionAmount = Number(order.total) * commissionRate;

    await this.prisma.commission.create({
      data: {
        orderId: order.id,
        orgId: order.sellerOrgId,
        kind: order.type,
        rate: commissionRate,
        amount: commissionAmount,
        currency: order.currency,
      },
    });
  }

  // Placeholder methods for other payment providers
  private async createPayPalOrder(amount: number, currency: string, metadata: any) {
    // TODO: Implement PayPal order creation
    return {
      id: 'paypal_order_' + Date.now(),
      client_secret: 'paypal_secret_' + Date.now(),
    };
  }

  private async createSPEIInstruction(amount: number, currency: string, metadata: any) {
    // TODO: Implement SPEI instruction generation
    return {
      id: 'spei_instruction_' + Date.now(),
      client_secret: 'spei_secret_' + Date.now(),
    };
  }

  private async createPIXInstruction(amount: number, currency: string, metadata: any) {
    // TODO: Implement PIX instruction generation
    return {
      id: 'pix_instruction_' + Date.now(),
      client_secret: 'pix_secret_' + Date.now(),
    };
  }

  private async confirmPayPalOrder(orderId: string) {
    // TODO: Implement PayPal order confirmation
    return { status: 'succeeded' };
  }
}