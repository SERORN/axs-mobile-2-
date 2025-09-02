import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PurchaseStatus {
  INITIATED = 'INITIATED',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
  FINANCING = 'FINANCING',
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 'vehicle-id-123' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 'dealership-id-123' })
  @IsString()
  dealershipId: string;

  @ApiProperty({ example: 'customer-id-123' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'salesperson-id-123', required: false })
  @IsOptional()
  @IsString()
  salespersonId?: string;

  @ApiProperty({ example: 25000.50 })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'mxn' })
  @IsString()
  currency: string = 'mxn';

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PurchaseStatus, example: PurchaseStatus.INITIATED })
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus = PurchaseStatus.INITIATED;

  @ApiProperty({ example: 'pi_1234567890', required: false })
  @IsOptional()
  @IsString()
  stripePaymentId?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsJSON()
  metadata?: any;
}

export class UpdatePurchaseDto {
  @ApiProperty({ enum: PurchaseStatus, example: PurchaseStatus.PAID, required: false })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @ApiProperty({ example: 'pi_9876543210', required: false })
  @IsOptional()
  @IsString()
  stripePaymentId?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsJSON()
  metadata?: any;
}

export class CreateOwnershipDto {
  @ApiProperty({ example: 'customer-id-123' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ example: 'First owner', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}