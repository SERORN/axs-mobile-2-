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
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
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
            this.logger.warn('🔄 Webhook received in mock mode');
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
                });
            }
            return { received: true, mode: 'mock' };
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error('❌ Webhook signature verification failed:', err.message);
            throw new common_1.BadRequestException('Webhook signature verification failed');
        }
        this.logger.log(`✅ Stripe webhook received: ${event.type}`);
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
                this.logger.log(`🔄 Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
    async handlePaymentSucceeded(paymentIntent) {
        const { id, amount, currency, metadata } = paymentIntent;
        this.logger.log(`💰 Payment succeeded: ${id}, amount: ${amount} ${currency}`);
        try {
            await this.prisma.payment.updateMany({
                where: { intentId: id },
                data: {
                    status: 'SUCCEEDED',
                    capturedAt: new Date(),
                },
            });
            if (metadata?.orderId) {
                await this.prisma.order.update({
                    where: { id: metadata.orderId },
                    data: { paymentStatus: 'PAID' },
                });
            }
            this.logger.log(`✅ Payment ${id} processed successfully`);
        }
        catch (error) {
            this.logger.error(`❌ Error processing payment ${id}:`, error);
        }
    }
    async handlePaymentFailed(paymentIntent) {
        const { id, last_payment_error } = paymentIntent;
        this.logger.warn(`❌ Payment failed: ${id}, reason: ${last_payment_error?.message}`);
        try {
            await this.prisma.payment.updateMany({
                where: { intentId: id },
                data: {
                    status: 'FAILED',
                },
            });
            this.logger.log(`✅ Failed payment ${id} recorded`);
        }
        catch (error) {
            this.logger.error(`❌ Error recording failed payment ${id}:`, error);
        }
    }
    async handleChargeDispute(dispute) {
        const { id, charge, reason } = dispute;
        this.logger.warn(`⚠️ Charge dispute created: ${id}, charge: ${charge}, reason: ${reason}`);
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe webhooks' }),
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map