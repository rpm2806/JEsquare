import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'TEACHER', enum: ['TEACHER', 'STUDENT'] })
  @IsOptional()
  @IsIn(['TEACHER', 'STUDENT'])
  role?: string;
}
