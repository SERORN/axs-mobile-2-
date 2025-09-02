import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/payment.dto';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    createPaymentIntent(req: any, createPaymentDto: CreatePaymentIntentDto): Promise<{
        paymentId: any;
        clientSecret: any;
        intentId: any;
        amount: number;
        currency: string;
        provider: "STRIPE" | "PAYPAL" | "SPEI" | "PIX";
    }>;
    confirmPayment(confirmPaymentDto: ConfirmPaymentDto, req: any): Promise<{
        success: boolean;
        paymentId: any;
        status: string;
        error?: undefined;
    } | {
        success: boolean;
        status: any;
        error: any;
        paymentId?: undefined;
    }>;
    getPaymentHistory(req: any): Promise<any>;
}
