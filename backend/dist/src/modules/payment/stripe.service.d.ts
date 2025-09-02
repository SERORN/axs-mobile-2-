import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeService {
    private configService;
    private stripe;
    constructor(configService: ConfigService);
    createPaymentIntent(amount: number, currency?: string, metadata?: any): Promise<Stripe.Response<Stripe.PaymentIntent> | {
        id: string;
        client_secret: string;
        amount: number;
        currency: string;
        status: string;
        metadata: any;
    }>;
    confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent> | {
        id: string;
        status: string;
        amount: number;
        currency: string;
    }>;
    createCustomer(email: string, name?: string, phone?: string): Promise<Stripe.Response<Stripe.Customer> | {
        id: string;
        email: string;
        name: string;
        phone: string;
    }>;
    retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.Response<Stripe.PaymentMethod> | {
        id: string;
        type: string;
        card: {
            brand: string;
            last4: string;
        };
    }>;
    createRefund(chargeId: string, amount?: number): Promise<Stripe.Response<Stripe.Refund> | {
        id: string;
        charge: string;
        amount: number;
        status: string;
    }>;
}
