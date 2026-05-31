import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPass123', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'STUDENT', enum: ['SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT', 'SOLVER'] })
  @IsOptional()
  @IsIn(['SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT', 'SOLVER'])
  role?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;
}
