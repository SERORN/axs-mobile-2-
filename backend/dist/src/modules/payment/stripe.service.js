"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeService = class StripeService {
    constructor(configService) {
        this.configService = configService;
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!secretKey) {
            console.warn('⚠️  Stripe secret key not configured. Payment service will use mock mode.');
            return;
        }
        this.stripe = new stripe_1.default(secretKey, {
            apiVersion: '2023-10-16',
        });
    }
    async createPaymentIntent(amount, currency = 'usd', metadata) {
        if (!this.stripe) {
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
                amount: Math.round(amount * 100),
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent;
        }
        catch (error) {
            console.error('Stripe payment intent creation error:', error);
            throw new Error('Failed to create payment intent');
        }
    }
    async confirmPaymentIntent(paymentIntentId) {
        if (!this.stripe) {
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
        }
        catch (error) {
            console.error('Stripe payment intent retrieval error:', error);
            throw new Error('Failed to retrieve payment intent');
        }
    }
    async createCustomer(email, name, phone) {
        if (!this.stripe) {
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
        }
        catch (error) {
            console.error('Stripe customer creation error:', error);
            throw new Error('Failed to create customer');
        }
    }
    async retrievePaymentMethod(paymentMethodId) {
        if (!this.stripe) {
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
        }
        catch (error) {
            console.error('Stripe payment method retrieval error:', error);
            throw new Error('Failed to retrieve payment method');
        }
    }
    async createRefund(chargeId, amount, reason) {
        if (!this.stripe) {
            return {
                id: `mock_re_${Date.now()}`,
                charge: chargeId,
                amount: amount || 1000,
                status: 'succeeded',
                reason,
            };
        }
        try {
            const refund = await this.stripe.refunds.create({
                charge: chargeId,
                amount: amount ? Math.round(amount) : undefined,
                reason: reason,
            });
            return refund;
        }
        catch (error) {
            console.error('Stripe refund creation error:', error);
            throw new Error('Failed to create refund');
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map