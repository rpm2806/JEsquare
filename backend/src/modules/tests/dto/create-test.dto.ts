import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestDto {
  @ApiProperty({ example: 'JEE Mock Test 1' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Full length mock test for JEE Main' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'CUSTOM', enum: ['CHAPTER', 'SUBJECT', 'FULL_SYLLABUS', 'CUSTOM'] })
  @IsNotEmpty()
  @IsIn(['CHAPTER', 'SUBJECT', 'FULL_SYLLABUS', 'CUSTOM'])
  type: string;

  @ApiPropertyOptional({ example: 180, description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber()
  totalMarks?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  negativeMarking?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ example: '2025-01-01T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ example: '2025-01-01T13:00:00Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ example: 'institute-uuid' })
  @IsOptional()
  @IsString()
  instituteId?: string;

  @ApiPropertyOptional({ example: ['question-uuid-1', 'question-uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionIds?: string[];

  @ApiPropertyOptional({ example: ['batch-uuid-1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  batchIds?: string[];
}
