import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  orderId: string;

  @ApiProperty({ 
    example: 'STRIPE',
    enum: ['STRIPE', 'PAYPAL', 'SPEI', 'PIX'],
    description: 'Payment provider'
  })
  @IsEnum(['STRIPE', 'PAYPAL', 'SPEI', 'PIX'])
  provider: string;

  @ApiProperty({ example: 'MXN', default: 'MXN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ 
    example: { 
      saveCard: false,
      customerId: 'customer-id' 
    },
    required: false 
  })
  @IsOptional()
  metadata?: object;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_1ABC123...' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ 
    example: 'STRIPE',
    enum: ['STRIPE', 'PAYPAL', 'SPEI', 'PIX']
  })
  @IsEnum(['STRIPE', 'PAYPAL', 'SPEI', 'PIX'])
  provider: string;

  @ApiProperty({ example: 'pm_1ABC123...', required: false })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class RefundPaymentDto {
  @ApiProperty({ example: 'payment-id-123' })
  @IsString()
  paymentId: string;

  @ApiProperty({ example: 100.50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ example: 'Customer requested refund', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ProcessWebhookDto {
  @ApiProperty({ 
    example: 'STRIPE',
    enum: ['STRIPE', 'PAYPAL', 'SPEI', 'PIX']
  })
  @IsEnum(['STRIPE', 'PAYPAL', 'SPEI', 'PIX'])
  provider: string;

  @ApiProperty({ example: 'evt_1ABC123...' })
  @IsString()
  eventId: string;

  @ApiProperty()
  payload: object;

  @ApiProperty({ example: 'whsec_123...', required: false })
  @IsOptional()
  @IsString()
  signature?: string;
}
