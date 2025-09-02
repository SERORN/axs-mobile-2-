import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDealershipDto {
  @ApiProperty({ example: 'DEAL001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Toyota Downtown' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Miami' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'FL' })
  @IsString()
  state: string;

  @ApiProperty({ example: '+1-555-123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'contact@toyotadowntown.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateDealershipDto {
  @ApiProperty({ example: 'Toyota Downtown Updated', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '456 Oak Avenue', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Miami Beach', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'FL', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '+1-555-987-6543', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'info@toyotadowntown.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}