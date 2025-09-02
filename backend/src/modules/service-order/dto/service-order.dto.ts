import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ServiceOrderStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export class CreateServiceOrderDto {
  @ApiProperty({ example: 'SO-2024-001' })
  @IsString()
  orderNumber: string;

  @ApiProperty({ example: 'dealership-id-123' })
  @IsString()
  dealershipId: string;

  @ApiProperty({ example: 'vehicle-id-123' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 'customer-id-123' })
  @IsString()
  customerId: string;

  @ApiProperty({ enum: ServiceOrderStatus, example: ServiceOrderStatus.OPEN })
  @IsEnum(ServiceOrderStatus)
  status: ServiceOrderStatus = ServiceOrderStatus.OPEN;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsJSON()
  work?: any;

  @ApiProperty({ example: 150.00, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @ApiProperty({ example: 'mxn' })
  @IsString()
  currency: string = 'mxn';

  @ApiProperty({ example: '2024-01-15T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  openedAt?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsJSON()
  metadata?: any;
}

export class UpdateServiceOrderDto {
  @ApiProperty({ enum: ServiceOrderStatus, example: ServiceOrderStatus.IN_PROGRESS, required: false })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsJSON()
  work?: any;

  @ApiProperty({ example: 200.00, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @ApiProperty({ example: '2024-01-15T18:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  closedAt?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsJSON()
  metadata?: any;
}

export class CreatePaymentIntentForServiceDto {
  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'mxn' })
  @IsString()
  currency: string = 'mxn';

  @ApiProperty({ example: 'Oil change service', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}