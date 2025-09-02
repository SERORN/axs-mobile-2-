import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PassModule } from './modules/pass/pass.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';
// New AXS modules
import { TenantModule } from './modules/tenant/tenant.module';
import { AccessPointModule } from './modules/access-point/access-point.module';
import { FlowModule } from './modules/flow/flow.module';
import { VisitModule } from './modules/visit/visit.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Core modules
    PrismaModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UserModule,
    PricingModule,
    PaymentModule,
    PassModule,
    NotificationModule,
    
    // New AXS modules
    TenantModule,
    AccessPointModule,
    FlowModule,
    VisitModule,
  ],
})
export class AppModule {}
