import { IsPhoneNumber, IsOptional, IsString, IsEmail } from 'class-validator';
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
  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
