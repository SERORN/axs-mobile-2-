export declare enum PassType {
    HOURLY = "HOURLY",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    GUEST = "GUEST",
    VIP_LOUNGE = "VIP_LOUNGE"
}
export declare class CreatePaymentIntentDto {
    amount: number;
    currency?: string;
    passType: PassType;
    plazaId: string;
    vehicleId?: string;
    validUntil?: string;
}
export declare class ConfirmPaymentDto {
    paymentIntentId: string;
    transactionId: string;
}
