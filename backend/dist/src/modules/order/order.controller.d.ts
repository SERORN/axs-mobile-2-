import { OrderService } from './order.service';
import { AddToCartDto, UpdateCartItemDto, CreateOrderDto, UpdateOrderStatusDto, OrderSearchDto } from './dto/order.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    getCart(req: any): Promise<any>;
    addToCart(addToCartDto: AddToCartDto, req: any): Promise<any>;
    updateCartItem(itemId: string, updateDto: UpdateCartItemDto, req: any): Promise<any>;
    removeCartItem(itemId: string, req: any): Promise<{
        message: string;
    }>;
    clearCart(req: any): Promise<{
        message: string;
    }>;
    createOrder(createOrderDto: CreateOrderDto, req: any): Promise<any[]>;
    getOrders(searchDto: OrderSearchDto, req: any): Promise<{
        orders: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    }>;
    getOrderById(id: string, req: any): Promise<any>;
    updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto, req: any): Promise<any>;
}
