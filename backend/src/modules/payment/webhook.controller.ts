import { Controller, Post, Body, Headers, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import Stripe from 'stripe';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private stripe: Stripe;
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleStripeWebhook(
    @Body() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    // Mock mode for development
    if (!this.stripe || !webhookSecret) {
      this.logger.warn('🔄 Webhook received in mock mode');
      
      // Simulate payment succeeded event
      const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      
      if (body?.type === 'payment_intent.succeeded' || !body?.type) {
        await this.handlePaymentSucceeded({
          id: body?.data?.object?.id || 'mock_pi_' + Date.now(),
          amount: body?.data?.object?.amount || 2500,
          currency: body?.data?.object?.currency || 'mxn',
          latest_charge: 'mock_ch_' + Date.now(),
          metadata: body?.data?.object?.metadata || {
            userId: 'mock_user_id',
            orderId: 'mock_order_id',
          }
        } as any);
      }
      
      return { received: true, mode: 'mock' };
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error('❌ Webhook signature verification failed:', err.message);
      throw new BadRequestException('Webhook signature verification failed');
    }

    this.logger.log(`✅ Stripe webhook received: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'charge.dispute.created':
        await this.handleChargeDispute(event.data.object as Stripe.Dispute);
        break;

      default:
        this.logger.log(`🔄 Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { id, amount, currency, metadata } = paymentIntent;
    
    this.logger.log(`💰 Payment succeeded: ${id}, amount: ${amount} ${currency}`);

    try {
      // Update payment record in database
      await this.prisma.payment.updateMany({
        where: { intentId: id },
        data: {
          status: 'SUCCEEDED',
          capturedAt: new Date(),
        },
      });

      // Update order payment status
      if (metadata?.orderId) {
        await this.prisma.order.update({
          where: { id: metadata.orderId },
          data: { paymentStatus: 'PAID' },
        });
      }

      this.logger.log(`✅ Payment ${id} processed successfully`);
    } catch (error) {
      this.logger.error(`❌ Error processing payment ${id}:`, error);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { id, last_payment_error } = paymentIntent;
    
    this.logger.warn(`❌ Payment failed: ${id}, reason: ${last_payment_error?.message}`);

    try {
      // Update payment record
      await this.prisma.payment.updateMany({
        where: { intentId: id },
        data: {
          status: 'FAILED',
        },
      });

      this.logger.log(`✅ Failed payment ${id} recorded`);
    } catch (error) {
      this.logger.error(`❌ Error recording failed payment ${id}:`, error);
    }
  }

  private async handleChargeDispute(dispute: Stripe.Dispute) {
    const { id, charge, reason } = dispute;
    
    this.logger.warn(`⚠️ Charge dispute created: ${id}, charge: ${charge}, reason: ${reason}`);

    // TODO: Implement dispute handling logic
    // This might involve:
    // 1. Notifying the seller
    // 2. Putting the order on hold
    // 3. Collecting evidence for the dispute
  }
}