import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RateDoubtDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
