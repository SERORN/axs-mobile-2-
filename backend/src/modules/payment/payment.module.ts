import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController, WebhookController],
  providers: [PaymentService, StripeService],
  exports: [PaymentService, StripeService],
})
export class PaymentModule {}
