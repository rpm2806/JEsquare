import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DifficultyDistribution {
  @ApiProperty({ example: 30, description: 'Percentage of easy questions' })
  @IsNumber()
  easy: number;

  @ApiProperty({ example: 50, description: 'Percentage of medium questions' })
  @IsNumber()
  medium: number;

  @ApiProperty({ example: 20, description: 'Percentage of hard questions' })
  @IsNumber()
  hard: number;
}

export class SectionConfig {
  @ApiProperty({ example: 'Physics' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'subject-uuid' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiPropertyOptional({ example: ['chapter-uuid-1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chapterIds?: string[];

  @ApiProperty({ example: 30 })
  @IsNumber()
  questionCount: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  marksPerQuestion?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  negativeMarksPerQuestion?: number;

  @ApiPropertyOptional({ type: DifficultyDistribution })
  @IsOptional()
  @ValidateNested()
  @Type(() => DifficultyDistribution)
  difficultyDistribution?: DifficultyDistribution;
}

export class GenerateTestDto {
  @ApiProperty({ example: 'Generated Mock Test' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Auto-generated test' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'FULL_SYLLABUS', enum: ['CHAPTER', 'SUBJECT', 'FULL_SYLLABUS', 'CUSTOM'] })
  @IsNotEmpty()
  @IsIn(['CHAPTER', 'SUBJECT', 'FULL_SYLLABUS', 'CUSTOM'])
  type: string;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ example: 'institute-uuid' })
  @IsOptional()
  @IsString()
  instituteId?: string;

  @ApiProperty({ type: [SectionConfig] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionConfig)
  sections: SectionConfig[];
}
