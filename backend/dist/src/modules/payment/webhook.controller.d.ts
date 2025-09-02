import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class WebhookController {
    private configService;
    private prisma;
    private stripe;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    handleStripeWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
        mode: string;
    } | {
        received: boolean;
        mode?: undefined;
    }>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private handleChargeDispute;
    private defaultValidityFor;
    private createPassFromPayment;
}
