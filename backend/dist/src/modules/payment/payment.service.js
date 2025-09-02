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
        const { orderId, provider, currency = 'MXN', metadata } = createPaymentDto;
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
            throw new common_1.NotFoundException('Order not found');
        }
        const canPay = order.buyerUserId === userId ||
            (order.buyerOrg && await this.userBelongsToOrg(userId, order.buyerOrg.id));
        if (!canPay) {
            throw new common_1.BadRequestException('Not authorized to pay for this order');
        }
        if (order.paymentStatus === 'PAID') {
            throw new common_1.BadRequestException('Order is already paid');
        }
        const amount = Number(order.total);
        let paymentIntent;
        switch (provider) {
            case 'STRIPE':
                paymentIntent = await this.stripeService.createPaymentIntent(amount * 100, currency.toLowerCase(), {
                    userId,
                    orderId,
                    ...metadata,
                });
                break;
            case 'PAYPAL':
                paymentIntent = await this.createPayPalOrder(amount, currency, { userId, orderId, ...metadata });
                break;
            case 'SPEI':
                paymentIntent = await this.createSPEIInstruction(amount, currency, { userId, orderId, ...metadata });
                break;
            case 'PIX':
                paymentIntent = await this.createPIXInstruction(amount, currency, { userId, orderId, ...metadata });
                break;
            default:
                throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
        }
        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                provider,
                intentId: paymentIntent.id,
                amount,
                currency,
                net: amount,
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
    async confirmPayment(confirmPaymentDto, userId) {
        const { paymentIntentId, provider, paymentMethodId } = confirmPaymentDto;
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
            throw new common_1.NotFoundException('Payment not found');
        }
        let result;
        switch (provider) {
            case 'STRIPE':
                result = await this.stripeService.confirmPaymentIntent(paymentIntentId);
                break;
            case 'PAYPAL':
                result = await this.confirmPayPalOrder(paymentIntentId);
                break;
            default:
                throw new common_1.BadRequestException(`Payment confirmation not supported for provider: ${provider}`);
        }
        if (result.status === 'succeeded') {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'SUCCEEDED',
                    capturedAt: new Date(),
                    fee: this.calculateFee(Number(payment.amount), provider, payment.order.sellerOrg.subscriptionPlan),
                },
            });
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: { paymentStatus: 'PAID' },
            });
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
    async getPaymentHistory(userId, userRole) {
        let where = {};
        if (userRole === 'CLIENT') {
            where = {
                order: {
                    buyerUserId: userId,
                },
            };
        }
        else if (userRole === 'PROVIDER' || userRole === 'DISTRIBUTOR') {
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
    async userBelongsToOrg(userId, orgId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        return user?.orgId === orgId;
    }
    calculateFee(amount, provider, subscriptionPlan) {
        let baseRate = 0.035;
        switch (provider) {
            case 'STRIPE':
                baseRate = 0.035;
                break;
            case 'PAYPAL':
                baseRate = 0.04;
                break;
            case 'SPEI':
                baseRate = 0.02;
                break;
            case 'PIX':
                baseRate = 0.025;
                break;
        }
        switch (subscriptionPlan) {
            case 'PRO':
                baseRate *= 0.9;
                break;
            case 'ELITE':
                baseRate *= 0.8;
                break;
        }
        return Math.round(amount * baseRate * 100) / 100;
    }
    async createCommission(order) {
        const commissionRate = order.type === 'B2B' ? 0.02 : 0.035;
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
    async createPayPalOrder(amount, currency, metadata) {
        return {
            id: 'paypal_order_' + Date.now(),
            client_secret: 'paypal_secret_' + Date.now(),
        };
    }
    async createSPEIInstruction(amount, currency, metadata) {
        return {
            id: 'spei_instruction_' + Date.now(),
            client_secret: 'spei_secret_' + Date.now(),
        };
    }
    async createPIXInstruction(amount, currency, metadata) {
        return {
            id: 'pix_instruction_' + Date.now(),
            client_secret: 'pix_secret_' + Date.now(),
        };
    }
    async confirmPayPalOrder(orderId) {
        return { status: 'succeeded' };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map