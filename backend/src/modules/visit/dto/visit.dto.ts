import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckinDto {
  @ApiProperty({ example: 'agencia-lomas-vehicular-1' })
  @IsString()
  accessPointPublicId: string;

  @ApiProperty({ 
    example: { vin: '3VW...', plate: 'ABC123', km: 45678, reason: 'service' },
    description: 'Form answers from the flow'
  })
  @IsObject()
  answers: Record<string, any>;

  @ApiProperty({ 
    example: ['data:image/jpeg;base64,...'],
    description: 'Base64 encoded photos'
  })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  guest?: boolean;
}

export class CheckoutDto {
  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}