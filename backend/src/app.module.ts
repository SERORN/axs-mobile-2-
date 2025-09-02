import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';

// ToothPick marketplace modules
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { CategoryModule } from './modules/category/category.module';

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
    PaymentModule,
    NotificationModule,
    
    // ToothPick marketplace modules
    ProductModule,
    OrderModule,
    CategoryModule,
  ],
})
export class AppModule {}
