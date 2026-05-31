import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTestDto {
  @ApiPropertyOptional({ example: 'Updated Test Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  totalMarks?: number;

  @ApiPropertyOptional({ example: 0.25 })
  @IsOptional()
  @IsNumber()
  negativeMarking?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ example: '2025-06-01T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ example: '2025-06-01T13:00:00Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
