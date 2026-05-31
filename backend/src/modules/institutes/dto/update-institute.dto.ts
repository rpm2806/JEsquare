import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInstituteDto {
  @ApiPropertyOptional({ example: 'Updated Academy' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'new-domain.com' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsOptional()
  @IsString()
  brandPrimaryColor?: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  brandSecondaryColor?: string;

  @ApiPropertyOptional({ example: '456 New St, City' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+91-0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://updated-academy.com' })
  @IsOptional()
  @IsString()
  website?: string;
}
