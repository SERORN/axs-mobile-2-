import { IsPhoneNumber, IsOptional, IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}

export class RegisterDto {
  @ApiProperty({ example: '+525512345678' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: 'CLIENT', 
    enum: ['ADMIN', 'PROVIDER', 'DISTRIBUTOR', 'CLIENT'],
    default: 'CLIENT',
    required: false 
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'PROVIDER', 'DISTRIBUTOR', 'CLIENT'])
  role?: string;

  @ApiProperty({ 
    example: 'Dental Supplies Inc', 
    required: false,
    description: 'Required for PROVIDER and DISTRIBUTOR roles'
  })
  @IsOptional()
  @IsString()
  organizationName?: string;
}
