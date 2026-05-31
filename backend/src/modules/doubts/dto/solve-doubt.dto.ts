import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SolveDoubtDto {
  @ApiProperty({ example: 'The integral ∫(x²+1)dx = x³/3 + x + C' })
  @IsNotEmpty()
  @IsString()
  response: string;
}
