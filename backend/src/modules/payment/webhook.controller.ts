import { Controller, Post, Body, Headers, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import Stripe from 'stripe';
import { Prisma, PrismaClient } from '@prisma/client';

// Tipos inferidos a partir de los inputs reales del cliente generado
type PassCreateInput = Parameters<PrismaClient['pass']['create']>[0]['data'];
type PassTypeT = PassCreateInput['type'];

type PlazaCreateInput = Parameters<PrismaClient['plaza']['create']>[0]['data'];
type PlazaTypeT = PlazaCreateInput extends { type: infer T } ? T : string;

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private stripe: Stripe;
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleStripeWebhook(
    @Body() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    // 🔥 MODO DESARROLLO: Si no hay configuración de Stripe, simula eventos
    if (!this.stripe || !webhookSecret) {
      console.log('⚠️  Stripe webhook received in MOCK MODE');
      console.log('📦 Mock webhook data:', rawBody.toString());
      
      // Parse JSON for mock mode
      let body: any = {};
      try {
        body = JSON.parse(rawBody.toString());
      } catch (e) {
        console.log('📦 Raw body (not JSON):', rawBody.toString());
      }
      
      // Simular evento de pago exitoso para desarrollo
      if (body?.type === 'payment_intent.succeeded' || !body?.type) {
        await this.handlePaymentSucceeded({
          id: body?.data?.object?.id || 'mock_pi_' + Date.now(),
          amount: body?.data?.object?.amount || 2500,
          currency: body?.data?.object?.currency || 'usd',
          latest_charge: 'mock_ch_' + Date.now(),
          metadata: body?.data?.object?.metadata || {
            userId: 'mock_user_id',
            passType: 'DAILY',
            plazaId: 'plaza-parking-001'
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
      console.error('❌ Webhook signature verification failed:', err.message);
      throw new BadRequestException('Webhook signature verification failed');
    }

    console.log('✅ Stripe webhook received:', event.type);

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
        console.log(`🔄 Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('💰 Payment succeeded:', paymentIntent.id);
    
    try {
      // Update transaction status
      const transaction = await this.prisma.transaction.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { 
          status: 'COMPLETED',
          stripeChargeId: paymentIntent.latest_charge as string,
        },
      });

      // Handle dealership traceability payments
      const metadata = paymentIntent.metadata || {};
      
      if (metadata.serviceOrderId) {
        await this.handleServiceOrderPayment(paymentIntent, metadata.serviceOrderId);
      } else if (metadata.purchaseId) {
        await this.handlePurchasePayment(paymentIntent, metadata.purchaseId);
      } else if (metadata.passType && metadata.userId) {
        // Keep existing pass creation logic
        await this.createPassFromPayment(paymentIntent);
      }

      console.log('✅ Transaction updated:', transaction.count);
    } catch (error) {
      console.error('❌ Error handling payment success:', error);
    }
  }

  private async handleServiceOrderPayment(paymentIntent: Stripe.PaymentIntent, serviceOrderId: string) {
    console.log('🔧 Handling service order payment:', serviceOrderId);
    
    try {
      const serviceOrder = await this.prisma.serviceOrder.findUnique({
        where: { id: serviceOrderId },
      });

      if (!serviceOrder) {
        console.error('❌ Service order not found:', serviceOrderId);
        return;
      }

      await this.prisma.serviceOrder.update({
        where: { id: serviceOrderId },
        data: {
          stripePaymentId: paymentIntent.id,
          status: 'READY', // or 'DELIVERED' based on business rules
          amount: paymentIntent.amount ? paymentIntent.amount / 100 : serviceOrder.amount,
          currency: paymentIntent.currency || serviceOrder.currency,
          metadata: {
            ...serviceOrder.metadata as any,
            stripePaymentIntent: paymentIntent.id,
            paidAt: new Date().toISOString(),
          },
        },
      });

      console.log('✅ Service order payment processed:', serviceOrderId);
    } catch (error) {
      console.error('❌ Error handling service order payment:', error);
    }
  }

  private async handlePurchasePayment(paymentIntent: Stripe.PaymentIntent, purchaseId: string) {
    console.log('🚗 Handling purchase payment:', purchaseId);
    
    try {
      const purchase = await this.prisma.purchase.findUnique({
        where: { id: purchaseId },
      });

      if (!purchase) {
        console.error('❌ Purchase not found:', purchaseId);
        return;
      }

      await this.prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          stripePaymentId: paymentIntent.id,
          status: 'PAID',
          metadata: {
            ...purchase.metadata as any,
            stripePaymentIntent: paymentIntent.id,
            paidAt: new Date().toISOString(),
          },
        },
      });

      console.log('✅ Purchase payment processed:', purchaseId);
    } catch (error) {
      console.error('❌ Error handling purchase payment:', error);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('❌ Payment failed:', paymentIntent.id);
    
    try {
      await this.prisma.transaction.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'FAILED' },
      });
    } catch (error) {
      console.error('❌ Error handling payment failure:', error);
    }
  }

  private async handleChargeDispute(dispute: Stripe.Dispute) {
    console.log('⚠️  Charge dispute created:', dispute.id);
    
    try {
      await this.prisma.transaction.updateMany({
        where: { stripeChargeId: dispute.charge as string },
        data: { status: 'CANCELLED' },
      });
    } catch (error) {
      console.error('❌ Error handling charge dispute:', error);
    }
  }

  private defaultValidityFor(passType: PassTypeT) {
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime());
    const v = String(passType).toUpperCase();
    
    switch (v) {
      case 'HOURLY':
        validUntil.setHours(validUntil.getHours() + 1);
        break;
      case 'WEEKLY':
        validUntil.setDate(validUntil.getDate() + 7);
        break;
      case 'MONTHLY':
        validUntil.setMonth(validUntil.getMonth() + 1);
        break;
      case 'DAILY':
      default:
        validUntil.setDate(validUntil.getDate() + 1);
        break;
    }
    return { validFrom, validUntil };
  }

  private async createPassFromPayment(paymentIntent: Stripe.PaymentIntent) {
    // Check if pass already exists by looking for transaction
    const txByPi = await this.prisma.transaction.findFirst({
      where: { stripePaymentId: paymentIntent.id },
      select: { passId: true },
    });

    if (txByPi?.passId) {
      const existing = await this.prisma.pass.findUnique({ where: { id: txByPi.passId } });
      if (existing) {
        this.logger.log(`Pass ya existía para ${paymentIntent.id}: ${existing.id}`);
        return existing;
      }
    }

    const userId = String(paymentIntent.metadata?.userId ?? '');
    const plazaId = String(paymentIntent.metadata?.plazaId ?? 'unknown-plaza');

    // Mapear PassType seguro usando tipos inferidos
    const passType = (String(paymentIntent.metadata?.passType ?? 'DAILY') as unknown) as PassTypeT;
    const plazaType = ('DEALERSHIP' as unknown) as PlazaTypeT;

    if (!userId || !plazaId) {
      throw new Error('Missing required metadata: userId or plazaId');
    }

    // Tomar validFrom/validUntil si vienen; si no, calcular
    let validFrom = paymentIntent.metadata?.validFrom ? new Date(paymentIntent.metadata.validFrom) : null;
    let validUntil = paymentIntent.metadata?.validUntil ? new Date(paymentIntent.metadata.validUntil) : null;

    const invalidVF = !validFrom || isNaN(validFrom.getTime());
    const invalidVU = !validUntil || isNaN(validUntil.getTime());

    if (invalidVF || invalidVU) {
      const def = this.defaultValidityFor(passType);
      validFrom = def.validFrom;
      validUntil = def.validUntil;
    }

    const pass = await this.prisma.pass.create({
      data: {
        user: { connect: { id: userId } },
        type: passType,
        amount: Math.round((paymentIntent.amount ?? 0) / 100),
        currency: String(paymentIntent.currency ?? 'mxn').toLowerCase(),
        validFrom,
        validUntil,
        qrCode: `qr_${paymentIntent.id}`,
        plaza: {
          connectOrCreate: {
            where: { id: plazaId },
            create: {
              id: plazaId,
              name: 'Unknown Plaza',
              type: plazaType, // usar plazaType en lugar de defaultPlazaType
              address: 'Unknown Address',
              city: 'Unknown City',
              state: 'Unknown State',
            },
          },
        },
      },
    });

    console.log('✅ Pass created:', pass);
  }
}
