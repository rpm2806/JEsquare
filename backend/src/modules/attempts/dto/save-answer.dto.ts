import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveAnswerDto {
  @ApiProperty({ example: 'question-uuid' })
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  selectedOption?: string;

  @ApiPropertyOptional({ example: 9.8 })
  @IsOptional()
  @IsNumber()
  numericalAnswer?: number;

  @ApiPropertyOptional({ example: 30, description: 'Time spent on this question in seconds' })
  @IsOptional()
  @IsNumber()
  timeTaken?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isMarkedForReview?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isVisited?: boolean;
}
