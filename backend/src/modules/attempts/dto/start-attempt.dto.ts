import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartAttemptDto {
  @ApiProperty({ example: 'test-uuid' })
  @IsNotEmpty()
  @IsString()
  testId: string;
}
