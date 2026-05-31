import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'MCQ', enum: ['MCQ', 'NUMERICAL', 'MULTI_CORRECT'] })
  @IsNotEmpty()
  @IsIn(['MCQ', 'NUMERICAL', 'MULTI_CORRECT'])
  type: string;

  @ApiProperty({ example: 'What is the acceleration due to gravity on Earth?' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: '9.8 m/s²' })
  @IsOptional()
  @IsString()
  optionA?: string;

  @ApiPropertyOptional({ example: '10 m/s²' })
  @IsOptional()
  @IsString()
  optionB?: string;

  @ApiPropertyOptional({ example: '8.9 m/s²' })
  @IsOptional()
  @IsString()
  optionC?: string;

  @ApiPropertyOptional({ example: '11 m/s²' })
  @IsOptional()
  @IsString()
  optionD?: string;

  @ApiProperty({ example: 'A' })
  @IsNotEmpty()
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional({ example: 9.8 })
  @IsOptional()
  @IsNumber()
  numericalAnswer?: number;

  @ApiProperty({ example: 'MEDIUM', enum: ['EASY', 'MEDIUM', 'HARD'] })
  @IsNotEmpty()
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty: string;

  @ApiProperty({ example: 'subject-uuid' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ example: 'chapter-uuid' })
  @IsNotEmpty()
  @IsString()
  chapterId: string;

  @ApiPropertyOptional({ example: 'topic-uuid' })
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiPropertyOptional({ example: 'Using Newton\'s second law...' })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiPropertyOptional({ example: 'https://example.com/solution.png' })
  @IsOptional()
  @IsString()
  solutionImage?: string;

  @ApiPropertyOptional({ example: 'https://example.com/question.png' })
  @IsOptional()
  @IsString()
  questionImage?: string;

  @ApiPropertyOptional({ example: 'institute-uuid' })
  @IsOptional()
  @IsString()
  instituteId?: string;

  @ApiPropertyOptional({ example: 'JEE Advanced 2023' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'gravity,mechanics,kinematics' })
  @IsOptional()
  @IsString()
  tags?: string;
}
