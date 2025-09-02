import { PrismaService } from '../../shared/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/payment.dto';
export declare class PaymentService {
    private prisma;
    private stripeService;
    constructor(prisma: PrismaService, stripeService: StripeService);
    createPaymentIntent(userId: string, createPaymentDto: CreatePaymentIntentDto): Promise<{
        paymentIntent: import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent> | {
            id: string;
            client_secret: string;
            amount: number;
            currency: string;
            status: string;
            metadata: any;
        };
        transactionId: string;
    }>;
    confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<{
        success: boolean;
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            paymentMethod: string;
            stripePaymentId: string | null;
            stripeChargeId: string | null;
            passId: string | null;
        };
        paymentIntent: import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent> | {
            id: string;
            status: string;
            amount: number;
            currency: string;
        };
        status?: undefined;
    } | {
        success: boolean;
        status: string;
        transaction?: undefined;
        paymentIntent?: undefined;
    }>;
    getPaymentHistory(userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        paymentMethod: string;
        stripePaymentId: string | null;
        stripeChargeId: string | null;
        passId: string | null;
    }[]>;
}
