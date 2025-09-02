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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const stripe_service_1 = require("./stripe.service");
let PaymentService = class PaymentService {
    constructor(prisma, stripeService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
    }
    async createPaymentIntent(userId, createPaymentDto) {
        const { amount, currency = 'usd', passType, plazaId } = createPaymentDto;
        const now = new Date();
        const validFrom = now.toISOString();
        const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency, {
            userId,
            passType,
            plazaId,
            validFrom,
            validUntil,
        });
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
    async confirmPayment(confirmPaymentDto) {
        const { paymentIntentId, transactionId } = confirmPaymentDto;
        const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
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
    async getPaymentHistory(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return transactions;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map