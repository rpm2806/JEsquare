import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchDto {
  @ApiProperty({ example: 'JEE 2025 Batch A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Morning batch for JEE 2025 aspirants' })
  @IsOptional()
  @IsString()
  description?: string;
}
