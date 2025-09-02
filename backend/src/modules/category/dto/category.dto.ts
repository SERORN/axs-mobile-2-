import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Dental Implants' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: { 
      es: 'Implantes Dentales', 
      en: 'Dental Implants',
      pt: 'Implantes Dentais'
    } 
  })
  nameI18n: object;

  @ApiProperty({ example: 'parent-category-id', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Updated Dental Implants', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  nameI18n?: object;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  active?: boolean;
}

export class CategorySearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  level?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  active?: boolean;
}