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
import { DoubtsService } from './doubts.service';
import { CreateDoubtDto } from './dto/create-doubt.dto';
import { SolveDoubtDto } from './dto/solve-doubt.dto';
import { RateDoubtDto } from './dto/rate-doubt.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Doubts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doubts')
export class DoubtsController {
  constructor(private readonly doubtsService: DoubtsService) {}

  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit a doubt' })
  @ApiResponse({ status: 201, description: 'Doubt created' })
  async create(
    @Body() dto: CreateDoubtDto,
    @CurrentUser('id') studentId: string,
  ) {
    return this.doubtsService.create(dto, studentId);
  }

  @Get()
  @ApiOperation({ summary: 'List doubts (student: my doubts, solver: available)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'AI_ANSWERED', 'HUMAN_ANSWERED', 'RESOLVED'] })
  @ApiResponse({ status: 200, description: 'Paginated doubt list' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.doubtsService.findAll(user, page || 1, limit || 20, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doubt details' })
  @ApiResponse({ status: 200, description: 'Doubt detail' })
  async findOne(@Param('id') id: string) {
    return this.doubtsService.findOne(id);
  }

  @Post(':id/ai-answer')
  @ApiOperation({ summary: 'Generate AI answer for doubt (stubbed)' })
  @ApiResponse({ status: 200, description: 'AI answer generated' })
  async generateAiAnswer(@Param('id') id: string) {
    return this.doubtsService.generateAiAnswer(id);
  }

  @Post(':id/claim')
  @Roles('SOLVER')
  @ApiOperation({ summary: 'Solver claims a doubt' })
  @ApiResponse({ status: 200, description: 'Doubt claimed' })
  async claim(
    @Param('id') id: string,
    @CurrentUser('id') solverId: string,
  ) {
    return this.doubtsService.claimDoubt(id, solverId);
  }

  @Post(':id/solve')
  @Roles('SOLVER')
  @ApiOperation({ summary: 'Solver submits answer to doubt' })
  @ApiResponse({ status: 200, description: 'Doubt solved' })
  async solve(
    @Param('id') id: string,
    @Body() dto: SolveDoubtDto,
    @CurrentUser('id') solverId: string,
  ) {
    return this.doubtsService.solveDoubt(id, dto, solverId);
  }

  @Post(':id/rate')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Student rates the doubt response' })
  @ApiResponse({ status: 200, description: 'Rating submitted' })
  async rate(
    @Param('id') id: string,
    @Body() dto: RateDoubtDto,
    @CurrentUser('id') studentId: string,
  ) {
    return this.doubtsService.rateDoubt(id, dto.rating, studentId);
  }
}
