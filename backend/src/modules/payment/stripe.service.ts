import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      console.warn('⚠️  Stripe secret key not configured. Payment service will use mock mode.');
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: any) {
    if (!this.stripe) {
      // Mock mode for development
      return {
        id: `mock_pi_${Date.now()}`,
        client_secret: `mock_pi_${Date.now()}_secret`,
        amount,
        currency,
        status: 'requires_payment_method',
        metadata,
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    if (!this.stripe) {
      // Mock mode
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent retrieval error:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  async createCustomer(email: string, name?: string, phone?: string) {
    if (!this.stripe) {
      // Mock mode
      return {
        id: `mock_cus_${Date.now()}`,
        email,
        name,
        phone,
      };
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        phone,
      });

      return customer;
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new Error('Failed to create customer');
    }
  }

  async retrievePaymentMethod(paymentMethodId: string) {
    if (!this.stripe) {
      // Mock mode
      return {
        id: paymentMethodId,
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
        },
      };
    }

    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Stripe payment method retrieval error:', error);
      throw new Error('Failed to retrieve payment method');
    }
  }

  async createRefund(chargeId: string, amount?: number) {
    if (!this.stripe) {
      // Mock mode
      return {
        id: `mock_re_${Date.now()}`,
        charge: chargeId,
        amount: amount || 1000,
        status: 'succeeded',
      };
    }

    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return refund;
    } catch (error) {
      console.error('Stripe refund creation error:', error);
      throw new Error('Failed to create refund');
    }
  }
}
