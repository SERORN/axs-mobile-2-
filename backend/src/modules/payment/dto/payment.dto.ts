import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PassType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  GUEST = 'GUEST',
  VIP_LOUNGE = 'VIP_LOUNGE',
}

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 25.99, description: 'Amount in dollars' })
  @IsNumber()
  @Min(0.5)
  amount: number;

  @ApiProperty({ example: 'usd', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: PassType, example: PassType.DAILY })
  @IsEnum(PassType)
  passType: PassType;

  @ApiProperty({ example: 'plaza-parking-001' })
  @IsString()
  plazaId: string;

  @ApiProperty({ example: 'ABC123', required: false })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsString()
  validUntil?: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_1234567890abcdef' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ example: 'trans_1234567890' })
  @IsString()
  transactionId: string;
}
