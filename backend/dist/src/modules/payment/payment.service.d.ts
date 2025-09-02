import { PrismaService } from '../../shared/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/payment.dto';
export declare class PaymentService {
    private prisma;
    private stripeService;
    constructor(prisma: PrismaService, stripeService: StripeService);
    createPaymentIntent(userId: string, createPaymentDto: CreatePaymentIntentDto): Promise<{
        paymentId: any;
        clientSecret: any;
        intentId: any;
        amount: number;
        currency: string;
        provider: "STRIPE" | "PAYPAL" | "SPEI" | "PIX";
    }>;
    confirmPayment(confirmPaymentDto: ConfirmPaymentDto, userId: string): Promise<{
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
    getPaymentHistory(userId: string, userRole: string): Promise<any>;
    private userBelongsToOrg;
    private calculateFee;
    private createCommission;
    private createPayPalOrder;
    private createSPEIInstruction;
    private createPIXInstruction;
    private confirmPayPalOrder;
}
