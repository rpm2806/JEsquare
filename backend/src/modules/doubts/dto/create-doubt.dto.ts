import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDoubtDto {
  @ApiProperty({ example: 'How do I solve this integral: ∫(x²+1)dx?' })
  @IsNotEmpty()
  @IsString()
  questionText: string;

  @ApiPropertyOptional({ example: 'https://example.com/doubt-image.png' })
  @IsOptional()
  @IsString()
  questionImage?: string;

  @ApiPropertyOptional({ example: 'Mathematics' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Integration' })
  @IsOptional()
  @IsString()
  chapter?: string;
}
