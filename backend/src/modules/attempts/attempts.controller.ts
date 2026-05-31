import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { AntiCheatEventDto } from './dto/anti-cheat-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attempts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('start')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Start a test attempt' })
  @ApiResponse({ status: 201, description: 'Attempt started' })
  async startAttempt(
    @Body() dto: StartAttemptDto,
    @CurrentUser('id') studentId: string,
  ) {
    return this.attemptsService.startAttempt(dto.testId, studentId);
  }

  @Get('my')
  @ApiOperation({ summary: "Get student's attempts" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Student attempts' })
  async getMyAttempts(
    @CurrentUser('id') studentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attemptsService.getMyAttempts(studentId, page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attempt details with answers' })
  @ApiResponse({ status: 200, description: 'Attempt details' })
  async getAttempt(@Param('id') id: string) {
    return this.attemptsService.getAttemptWithAnswers(id);
  }

  @Post(':id/answer')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Save an answer (autosave)' })
  @ApiResponse({ status: 201, description: 'Answer saved' })
  async saveAnswer(
    @Param('id') id: string,
    @Body() dto: SaveAnswerDto,
    @CurrentUser('id') studentId: string,
  ) {
    return this.attemptsService.saveAnswer(id, dto, studentId);
  }

  @Post(':id/submit')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit attempt and calculate score' })
  @ApiResponse({ status: 200, description: 'Attempt submitted and evaluated' })
  async submitAttempt(
    @Param('id') id: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.attemptsService.submitAttempt(id, studentId);
  }

  @Post(':id/anti-cheat')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Log anti-cheat event (tab switch, copy/paste)' })
  @ApiResponse({ status: 200, description: 'Event logged' })
  async logAntiCheatEvent(
    @Param('id') id: string,
    @Body() dto: AntiCheatEventDto,
    @CurrentUser('id') studentId: string,
  ) {
    return this.attemptsService.logAntiCheatEvent(id, dto, studentId);
  }
}
