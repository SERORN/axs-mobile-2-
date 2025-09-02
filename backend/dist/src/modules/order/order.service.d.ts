import { PrismaService } from '../../shared/prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CreateOrderDto, UpdateOrderStatusDto, OrderSearchDto } from './dto/order.dto';
export declare class OrderService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateCart(userId: string, sessionId?: string): Promise<any>;
    addToCart(addToCartDto: AddToCartDto, userId: string, sessionId?: string): Promise<any>;
    updateCartItem(cartItemId: string, updateDto: UpdateCartItemDto, userId: string): Promise<any>;
    removeCartItem(cartItemId: string, userId: string): Promise<{
        message: string;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<any[]>;
    getOrders(searchDto: OrderSearchDto, userId: string, userRole: string): Promise<{
        orders: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    }>;
    getOrderById(id: string, userId: string, userRole: string): Promise<any>;
    updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto, userId: string, userRole: string): Promise<any>;
    private userBelongsToOrg;
}
