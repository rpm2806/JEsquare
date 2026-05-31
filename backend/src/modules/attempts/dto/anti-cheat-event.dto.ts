import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AntiCheatEventDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  tabSwitches?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  copyPasteEvents?: number;
}
