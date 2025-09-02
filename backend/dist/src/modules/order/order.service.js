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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let OrderService = class OrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateCart(userId, sessionId) {
        let cart = await this.prisma.cart.findFirst({
            where: userId ? { userId } : { sessionId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        provider: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: {
                    userId,
                    sessionId,
                },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: {
                                        include: {
                                            provider: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }
        return cart;
    }
    async addToCart(addToCartDto, userId, sessionId) {
        const { variantId, qty } = addToCartDto;
        const variant = await this.prisma.variant.findUnique({
            where: { id: variantId },
            include: { product: true },
        });
        if (!variant || !variant.active) {
            throw new common_1.NotFoundException('Product variant not found');
        }
        if (variant.stock < qty) {
            throw new common_1.BadRequestException(`Insufficient stock. Available: ${variant.stock}`);
        }
        if (qty < variant.minQty) {
            throw new common_1.BadRequestException(`Minimum quantity is ${variant.minQty}`);
        }
        const cart = await this.getOrCreateCart(userId, sessionId);
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });
        if (existingItem) {
            const newQty = existingItem.qty + qty;
            if (variant.stock < newQty) {
                throw new common_1.BadRequestException(`Insufficient stock. Available: ${variant.stock}, requested: ${newQty}`);
            }
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    qty: newQty,
                    unitPrice: variant.priceBase,
                },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    qty,
                    unitPrice: variant.priceBase,
                    currency: variant.currency,
                },
            });
        }
        return this.getOrCreateCart(userId, sessionId);
    }
    async updateCartItem(cartItemId, updateDto, userId) {
        const { qty } = updateDto;
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
                variant: true,
            },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (cartItem.cart.userId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to update this cart item');
        }
        if (cartItem.variant.stock < qty) {
            throw new common_1.BadRequestException(`Insufficient stock. Available: ${cartItem.variant.stock}`);
        }
        if (qty < cartItem.variant.minQty) {
            throw new common_1.BadRequestException(`Minimum quantity is ${cartItem.variant.minQty}`);
        }
        await this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { qty },
        });
        return this.getOrCreateCart(userId);
    }
    async removeCartItem(cartItemId, userId) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (cartItem.cart.userId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to remove this cart item');
        }
        await this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });
        return { message: 'Item removed from cart' };
    }
    async clearCart(userId) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
        });
        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }
        return { message: 'Cart cleared' };
    }
    async createOrder(createOrderDto, userId) {
        const { type, sellerOrgId, billingAddress, shippingAddress, notes } = createOrderDto;
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: { provider: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        let subtotal = 0;
        for (const item of cart.items) {
            subtotal += item.qty * Number(item.unitPrice);
        }
        const taxes = subtotal * 0.16;
        const shipping = 0;
        const total = subtotal + taxes + shipping;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (type === 'B2B' && !user?.organization) {
            throw new common_1.BadRequestException('B2B orders require organization membership');
        }
        const itemsByProvider = cart.items.reduce((acc, item) => {
            const providerId = item.variant.product.providerId;
            if (!acc[providerId]) {
                acc[providerId] = [];
            }
            acc[providerId].push(item);
            return acc;
        }, {});
        const orders = [];
        for (const [providerId, items] of Object.entries(itemsByProvider)) {
            const typedItems = items;
            const orderSubtotal = typedItems.reduce((sum, item) => sum + (item.qty * Number(item.unitPrice)), 0);
            const orderTaxes = orderSubtotal * 0.16;
            const orderTotal = orderSubtotal + orderTaxes;
            const order = await this.prisma.order.create({
                data: {
                    type,
                    buyerOrgId: type === 'B2B' ? user?.orgId : null,
                    buyerUserId: type === 'B2C' ? userId : null,
                    sellerOrgId: providerId,
                    subtotal: orderSubtotal,
                    taxes: orderTaxes,
                    shipping: 0,
                    total: orderTotal,
                    billingAddress,
                    shippingAddress,
                    notes,
                    items: {
                        create: typedItems.map(item => ({
                            variantId: item.variantId,
                            qty: item.qty,
                            unitPrice: item.unitPrice,
                            currency: item.currency,
                            taxRate: 0.16,
                            totalLine: item.qty * Number(item.unitPrice),
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: { product: true },
                            },
                        },
                    },
                    sellerOrg: true,
                    buyerOrg: true,
                    buyerUser: true,
                },
            });
            orders.push(order);
            for (const item of typedItems) {
                await this.prisma.variant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: {
                            decrement: item.qty,
                        },
                    },
                });
                await this.prisma.inventoryMovement.create({
                    data: {
                        variantId: item.variantId,
                        change: -item.qty,
                        reason: 'SALE',
                        reference: order.id,
                    },
                });
            }
        }
        await this.clearCart(userId);
        return orders;
    }
    async getOrders(searchDto, userId, userRole) {
        const { type, status, paymentStatus, page = 1, limit = 20, role } = searchDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (paymentStatus)
            where.paymentStatus = paymentStatus;
        if (userRole === 'CLIENT') {
            where.buyerUserId = userId;
        }
        else if (userRole === 'DISTRIBUTOR' || userRole === 'PROVIDER') {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (role === 'buyer') {
                where.buyerOrgId = user?.orgId;
            }
            else {
                where.sellerOrgId = user?.orgId;
            }
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            variant: {
                                include: { product: true },
                            },
                        },
                    },
                    sellerOrg: true,
                    buyerOrg: true,
                    buyerUser: true,
                    payments: true,
                    shipments: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getOrderById(id, userId, userRole) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true },
                        },
                    },
                },
                sellerOrg: true,
                buyerOrg: true,
                buyerUser: true,
                payments: true,
                shipments: true,
                invoices: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const hasAccess = (userRole === 'CLIENT' && order.buyerUserId === userId) ||
            (userRole === 'ADMIN') ||
            (order.buyerOrgId && await this.userBelongsToOrg(userId, order.buyerOrgId)) ||
            (await this.userBelongsToOrg(userId, order.sellerOrgId));
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Not authorized to view this order');
        }
        return order;
    }
    async updateOrderStatus(id, updateDto, userId, userRole) {
        const { status, notes } = updateDto;
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const hasAccess = (userRole === 'ADMIN') ||
            (await this.userBelongsToOrg(userId, order.sellerOrgId));
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Not authorized to update this order');
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status,
                ...(notes && { notes: `${order.notes || ''}\n\n${new Date().toISOString()}: ${notes}` }),
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true },
                        },
                    },
                },
                sellerOrg: true,
                buyerOrg: true,
                buyerUser: true,
            },
        });
        return updatedOrder;
    }
    async userBelongsToOrg(userId, orgId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        return user?.orgId === orgId;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map