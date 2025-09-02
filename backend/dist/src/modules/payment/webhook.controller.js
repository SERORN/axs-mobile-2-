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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const stripe_1 = require("stripe");
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(WebhookController_1.name);
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (secretKey) {
            this.stripe = new stripe_1.default(secretKey, {
                apiVersion: '2023-10-16',
            });
        }
    }
    async handleStripeWebhook(rawBody, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!this.stripe || !webhookSecret) {
            console.log('⚠️  Stripe webhook received in MOCK MODE');
            console.log('📦 Mock webhook data:', rawBody.toString());
            let body = {};
            try {
                body = JSON.parse(rawBody.toString());
            }
            catch (e) {
                console.log('📦 Raw body (not JSON):', rawBody.toString());
            }
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
                });
            }
            return { received: true, mode: 'mock' };
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message);
            throw new common_1.BadRequestException('Webhook signature verification failed');
        }
        console.log('✅ Stripe webhook received:', event.type);
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            case 'charge.dispute.created':
                await this.handleChargeDispute(event.data.object);
                break;
            default:
                console.log(`🔄 Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
    async handlePaymentSucceeded(paymentIntent) {
        console.log('💰 Payment succeeded:', paymentIntent.id);
        try {
            const transaction = await this.prisma.transaction.updateMany({
                where: { stripePaymentId: paymentIntent.id },
                data: {
                    status: 'COMPLETED',
                    stripeChargeId: paymentIntent.latest_charge,
                },
            });
            if (paymentIntent.metadata?.passType && paymentIntent.metadata?.userId) {
                await this.createPassFromPayment(paymentIntent);
            }
            console.log('✅ Transaction updated:', transaction.count);
        }
        catch (error) {
            console.error('❌ Error handling payment success:', error);
        }
    }
    async handlePaymentFailed(paymentIntent) {
        console.log('❌ Payment failed:', paymentIntent.id);
        try {
            await this.prisma.transaction.updateMany({
                where: { stripePaymentId: paymentIntent.id },
                data: { status: 'FAILED' },
            });
        }
        catch (error) {
            console.error('❌ Error handling payment failure:', error);
        }
    }
    async handleChargeDispute(dispute) {
        console.log('⚠️  Charge dispute created:', dispute.id);
        try {
            await this.prisma.transaction.updateMany({
                where: { stripeChargeId: dispute.charge },
                data: { status: 'CANCELLED' },
            });
        }
        catch (error) {
            console.error('❌ Error handling charge dispute:', error);
        }
    }
    defaultValidityFor(passType) {
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
    async createPassFromPayment(paymentIntent) {
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
        const passType = String(paymentIntent.metadata?.passType ?? 'DAILY');
        const plazaType = 'DEALERSHIP';
        if (!userId || !plazaId) {
            throw new Error('Missing required metadata: userId or plazaId');
        }
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
                            type: plazaType,
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
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Buffer, String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleStripeWebhook", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map