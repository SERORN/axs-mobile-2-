export declare class CheckinDto {
    accessPointPublicId: string;
    answers: Record<string, any>;
    photos?: string[];
    vehicleId?: string;
    guest?: boolean;
}
export declare class CheckoutDto {
    photos?: string[];
    notes?: string;
}
