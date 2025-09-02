export declare class AddToCartDto {
    variantId: string;
    qty: number;
}
export declare class UpdateCartItemDto {
    qty: number;
}
export declare class CreateOrderDto {
    type: string;
    sellerOrgId?: string;
    billingAddress: object;
    shippingAddress: object;
    notes?: string;
}
export declare class OrderItemDto {
    variantId: string;
    qty: number;
    unitPrice: number;
    currency?: string;
}
export declare class UpdateOrderStatusDto {
    status: string;
    notes?: string;
}
export declare class OrderSearchDto {
    type?: string;
    status?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
    role?: string;
}
