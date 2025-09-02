import { IsString, IsOptional, IsEmail, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalespersonDto {
  @ApiProperty({ example: 'dealership-id-123' })
  @IsString()
  dealershipId: string;

  @ApiProperty({ example: 'John Sales' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.sales@dealership.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1-555-123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean = true;

  @ApiProperty({ example: '2024-01-15T09:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  hiredAt?: string;
}

export class UpdateSalespersonDto {
  @ApiProperty({ example: 'John Sales Updated', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john.updated@dealership.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1-555-987-6543', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ example: '2024-01-15T09:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  hiredAt?: string;
}