import { IsString, IsOptional, IsArray, IsNumber, IsEnum, ValidateNested, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({ example: 'variant-id-123' })
  @IsString()
  variantId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  qty: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, minimum: 1 })
  @IsNumber()
  @Min(1)
  qty: number;
}

export class CreateOrderDto {
  @ApiProperty({ 
    example: 'B2C', 
    enum: ['B2B', 'B2C'],
    description: 'Order type - B2B for business orders, B2C for consumer orders'
  })
  @IsEnum(['B2B', 'B2C'])
  type: string;

  @ApiProperty({ 
    example: 'org-id-123', 
    required: false,
    description: 'Required for B2B orders - seller organization ID'
  })
  @IsOptional()
  @IsString()
  sellerOrgId?: string;

  @ApiProperty({
    example: {
      street: '123 Main St',
      city: 'Mexico City',
      state: 'CDMX',
      zipCode: '12345',
      country: 'MX'
    }
  })
  billingAddress: object;

  @ApiProperty({
    example: {
      street: '123 Main St',
      city: 'Mexico City', 
      state: 'CDMX',
      zipCode: '12345',
      country: 'MX'
    }
  })
  shippingAddress: object;

  @ApiProperty({ example: 'Please handle with care', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderItemDto {
  @ApiProperty({ example: 'variant-id-123' })
  @IsString()
  variantId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 'MXN', default: 'MXN' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    example: 'CONFIRMED',
    enum: ['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']
  })
  @IsEnum(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'])
  status: string;

  @ApiProperty({ example: 'Order confirmed and processing', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderSearchDto {
  @ApiProperty({ required: false, enum: ['B2B', 'B2C'] })
  @IsOptional()
  @IsEnum(['B2B', 'B2C'])
  type?: string;

  @ApiProperty({ 
    required: false,
    enum: ['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']
  })
  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'])
  status?: string;

  @ApiProperty({ 
    required: false,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED']
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
  paymentStatus?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ 
    required: false,
    description: 'Role-based filtering: seller/buyer perspective'
  })
  @IsOptional()
  @IsString()
  role?: string;
}