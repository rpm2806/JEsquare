import { IsOptional, IsString, IsIn, IsNumber, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuestionDto {
  @ApiPropertyOptional({ example: 'MCQ', enum: ['MCQ', 'NUMERICAL', 'MULTI_CORRECT'] })
  @IsOptional()
  @IsIn(['MCQ', 'NUMERICAL', 'MULTI_CORRECT'])
  type?: string;

  @ApiPropertyOptional({ example: 'Updated question text' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ example: 'Option A' })
  @IsOptional()
  @IsString()
  optionA?: string;

  @ApiPropertyOptional({ example: 'Option B' })
  @IsOptional()
  @IsString()
  optionB?: string;

  @ApiPropertyOptional({ example: 'Option C' })
  @IsOptional()
  @IsString()
  optionC?: string;

  @ApiPropertyOptional({ example: 'Option D' })
  @IsOptional()
  @IsString()
  optionD?: string;

  @ApiPropertyOptional({ example: 'B' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ example: 9.8 })
  @IsOptional()
  @IsNumber()
  numericalAnswer?: number;

  @ApiPropertyOptional({ example: 'HARD', enum: ['EASY', 'MEDIUM', 'HARD'] })
  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: string;

  @ApiPropertyOptional({ example: 'subject-uuid' })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({ example: 'chapter-uuid' })
  @IsOptional()
  @IsString()
  chapterId?: string;

  @ApiPropertyOptional({ example: 'topic-uuid' })
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiPropertyOptional({ example: 'Updated solution' })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solutionImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  questionImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'updated,tags' })
  @IsOptional()
  @IsString()
  tags?: string;
}
