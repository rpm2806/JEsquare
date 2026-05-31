import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'TEACHER', enum: ['SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT'] })
  @IsOptional()
  @IsIn(['SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT'])
  role?: string;
}
