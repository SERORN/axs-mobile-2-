import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsDecimal, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Dental Implant Kit' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: { 
      es: 'Kit de implante dental profesional', 
      en: 'Professional dental implant kit',
      pt: 'Kit de implante dental profissional'
    } 
  })
  descriptionI18n: object;

  @ApiProperty({ example: 'dental-implants' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'Straumann', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'DI-001-STR', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: '1234567890123', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: { material: 'Titanium', size: 'Various' }, required: false })
  @IsOptional()
  attributes?: object;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  requiresQuote?: boolean;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'Updated Dental Implant Kit', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  descriptionI18n?: object;

  @ApiProperty({ example: 'dental-implants', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 'Straumann', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  attributes?: object;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requiresQuote?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateVariantDto {
  @ApiProperty({ example: { size: 'Large', color: 'Blue' } })
  options: object;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceBase: number;

  @ApiProperty({ example: 'MXN', default: 'MXN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 0.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @ApiProperty({ example: { length: 10, width: 5, height: 2 }, required: false })
  @IsOptional()
  dimensions?: object;

  @ApiProperty({ example: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @ApiProperty({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  minQty?: number;
}

export class ProductSearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  requiresQuote?: boolean;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false, enum: ['CLIENT', 'DISTRIBUTOR', 'PROVIDER'] })
  @IsOptional()
  @IsString()
  role?: string;
}