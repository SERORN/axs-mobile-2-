import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class WebhookController {
    private prisma;
    private configService;
    private stripe;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
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
}
