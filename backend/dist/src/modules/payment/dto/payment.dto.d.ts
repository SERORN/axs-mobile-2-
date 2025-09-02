export declare class CreatePaymentIntentDto {
    orderId: string;
    provider: string;
    currency?: string;
    metadata?: object;
}
export declare class ConfirmPaymentDto {
    paymentIntentId: string;
    provider: string;
    paymentMethodId?: string;
}
export declare class RefundPaymentDto {
    paymentId: string;
    amount?: number;
    reason?: string;
}
export declare class ProcessWebhookDto {
    provider: string;
    eventId: string;
    payload: object;
    signature?: string;
}
