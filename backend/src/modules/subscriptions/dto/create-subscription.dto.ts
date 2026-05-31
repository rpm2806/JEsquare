import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'institute-uuid' })
  @IsNotEmpty()
  @IsString()
  instituteId: string;

  @ApiProperty({ example: 'PRO', enum: ['FREE', 'BASIC', 'PRO', 'INSTITUTE'] })
  @IsNotEmpty()
  @IsIn(['FREE', 'BASIC', 'PRO', 'INSTITUTE'])
  plan: string;

  @ApiPropertyOptional({ example: 'pay_mock_12345' })
  @IsOptional()
  @IsString()
  paymentId?: string;
}
