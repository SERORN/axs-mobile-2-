import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CreateOrderDto, UpdateOrderStatusDto, OrderSearchDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // ===== CART MANAGEMENT =====

  async getOrCreateCart(userId: string, sessionId?: string) {
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

  async addToCart(addToCartDto: AddToCartDto, userId: string, sessionId?: string) {
    const { variantId, qty } = addToCartDto;

    // Verify variant exists and get price
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.active) {
      throw new NotFoundException('Product variant not found');
    }

    // Check stock availability
    if (variant.stock < qty) {
      throw new BadRequestException(`Insufficient stock. Available: ${variant.stock}`);
    }

    // Check minimum quantity
    if (qty < variant.minQty) {
      throw new BadRequestException(`Minimum quantity is ${variant.minQty}`);
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQty = existingItem.qty + qty;
      
      if (variant.stock < newQty) {
        throw new BadRequestException(`Insufficient stock. Available: ${variant.stock}, requested: ${newQty}`);
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          qty: newQty,
          unitPrice: variant.priceBase,
        },
      });
    } else {
      // Create new cart item
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

  async updateCartItem(cartItemId: string, updateDto: UpdateCartItemDto, userId: string) {
    const { qty } = updateDto;

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        variant: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this cart item');
    }

    // Check stock and minimum quantity
    if (cartItem.variant.stock < qty) {
      throw new BadRequestException(`Insufficient stock. Available: ${cartItem.variant.stock}`);
    }

    if (qty < cartItem.variant.minQty) {
      throw new BadRequestException(`Minimum quantity is ${cartItem.variant.minQty}`);
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { qty },
    });

    return this.getOrCreateCart(userId);
  }

  async removeCartItem(cartItemId: string, userId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId) {
      throw new ForbiddenException('Not authorized to remove this cart item');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
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

  // ===== ORDER MANAGEMENT =====

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    const { type, sellerOrgId, billingAddress, shippingAddress, notes } = createOrderDto;

    // Get user cart
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
      throw new BadRequestException('Cart is empty');
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += item.qty * Number(item.unitPrice);
    }

    const taxes = subtotal * 0.16; // 16% IVA for Mexico
    const shipping = 0; // Calculate based on shipping rules
    const total = subtotal + taxes + shipping;

    // Get user organization for B2B orders
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    // For B2B orders, verify user has organization
    if (type === 'B2B' && !user?.organization) {
      throw new BadRequestException('B2B orders require organization membership');
    }

    // Group items by provider (each provider gets separate order)
    const itemsByProvider = cart.items.reduce((acc, item) => {
      const providerId = item.variant.product.providerId;
      if (!acc[providerId]) {
        acc[providerId] = [];
      }
      acc[providerId].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    const orders = [];

    // Create separate order for each provider
    for (const [providerId, items] of Object.entries(itemsByProvider)) {
      const typedItems = items as any[]; // Type assertion for the items array
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

      // Update inventory
      for (const item of typedItems) {
        await this.prisma.variant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });

        // Create inventory movement record
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

    // Clear cart after successful order creation
    await this.clearCart(userId);

    return orders;
  }

  async getOrders(searchDto: OrderSearchDto, userId: string, userRole: string) {
    const { type, status, paymentStatus, page = 1, limit = 20, role } = searchDto;
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    // Role-based filtering
    if (userRole === 'CLIENT') {
      where.buyerUserId = userId;
    } else if (userRole === 'DISTRIBUTOR' || userRole === 'PROVIDER') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (role === 'buyer') {
        where.buyerOrgId = user?.orgId;
      } else {
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

  async getOrderById(id: string, userId: string, userRole: string) {
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
      throw new NotFoundException('Order not found');
    }

    // Verify access rights
    const hasAccess = 
      (userRole === 'CLIENT' && order.buyerUserId === userId) ||
      (userRole === 'ADMIN') ||
      (order.buyerOrgId && await this.userBelongsToOrg(userId, order.buyerOrgId)) ||
      (await this.userBelongsToOrg(userId, order.sellerOrgId));

    if (!hasAccess) {
      throw new ForbiddenException('Not authorized to view this order');
    }

    return order;
  }

  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto, userId: string, userRole: string) {
    const { status, notes } = updateDto;

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only seller can update order status
    const hasAccess = 
      (userRole === 'ADMIN') ||
      (await this.userBelongsToOrg(userId, order.sellerOrgId));

    if (!hasAccess) {
      throw new ForbiddenException('Not authorized to update this order');
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

  private async userBelongsToOrg(userId: string, orgId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.orgId === orgId;
  }
}