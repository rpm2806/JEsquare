import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstituteDto {
  @ApiProperty({ example: 'Elite Academy' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'elite-academy.com' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  brandPrimaryColor?: string;

  @ApiPropertyOptional({ example: '#8b5cf6' })
  @IsOptional()
  @IsString()
  brandSecondaryColor?: string;

  @ApiPropertyOptional({ example: '123 Main St, City' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+91-1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://elite-academy.com' })
  @IsOptional()
  @IsString()
  website?: string;
}
