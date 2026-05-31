import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student/:id')
  @ApiOperation({ summary: 'Get student performance analytics' })
  @ApiResponse({ status: 200, description: 'Student performance data' })
  async getStudentPerformance(@Param('id') id: string) {
    return this.analyticsService.getStudentPerformance(id);
  }

  @Get('student/:id/weak-chapters')
  @ApiOperation({ summary: 'Get weak chapter analysis for a student' })
  @ApiResponse({ status: 200, description: 'Weak chapters with accuracy data' })
  async getWeakChapters(@Param('id') id: string) {
    return this.analyticsService.getWeakChapters(id);
  }

  @Get('institute/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @ApiOperation({ summary: 'Get institute-level analytics' })
  @ApiResponse({ status: 200, description: 'Institute analytics' })
  async getInstituteAnalytics(@Param('id') id: string) {
    return this.analyticsService.getInstituteAnalytics(id);
  }

  @Get('test/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get test-level analytics with score distribution' })
  @ApiResponse({ status: 200, description: 'Test analytics' })
  async getTestAnalytics(@Param('id') id: string) {
    return this.analyticsService.getTestAnalytics(id);
  }

  @Get('leaderboard/:testId')
  @ApiOperation({ summary: 'Get leaderboard for a test' })
  @ApiResponse({ status: 200, description: 'Test leaderboard rankings' })
  async getLeaderboard(@Param('testId') testId: string) {
    return this.analyticsService.getLeaderboard(testId);
  }
}
