import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { BulkCreateQuestionsDto } from './dto/bulk-create-questions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('meta/subjects')
  @ApiOperation({ summary: 'Get all subjects and chapters' })
  async getSubjectsAndChapters() {
    return this.questionsService.getSubjectsAndChapters();
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'Question created' })
  async create(@Body() dto: CreateQuestionDto, @CurrentUser('id') userId: string) {
    return this.questionsService.create(dto, userId);
  }

  @Post('bulk')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Bulk import questions' })
  @ApiResponse({ status: 201, description: 'Questions imported' })
  async bulkCreate(
    @Body() dto: BulkCreateQuestionsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionsService.bulkCreate(dto.questions, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List questions with advanced filtering' })
  @ApiQuery({ name: 'subject', required: false })
  @ApiQuery({ name: 'chapter', required: false })
  @ApiQuery({ name: 'topic', required: false })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['EASY', 'MEDIUM', 'HARD'] })
  @ApiQuery({ name: 'type', required: false, enum: ['MCQ', 'NUMERICAL', 'MULTI_CORRECT'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated question list' })
  async findAll(
    @Query('subject') subject?: string,
    @Query('chapter') chapter?: string,
    @Query('topic') topic?: string,
    @Query('difficulty') difficulty?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.questionsService.findAll({
      subject,
      chapter,
      topic,
      difficulty,
      type,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiResponse({ status: 200, description: 'Question details' })
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update question' })
  @ApiResponse({ status: 200, description: 'Question updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: any,
  ) {
    return this.questionsService.update(id, dto, user);
  }

  @Delete('clear-all')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Clear all questions from question bank (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Question bank cleared' })
  async clearAll() {
    return this.questionsService.clearAll();
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Delete question' })
  @ApiResponse({ status: 200, description: 'Question deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.questionsService.remove(id, user);
  }

  @Patch(':id/verify')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @ApiOperation({ summary: 'Verify a question (admin only)' })
  @ApiResponse({ status: 200, description: 'Question verified' })
  async verify(@Param('id') id: string, @CurrentUser() user: any) {
    return this.questionsService.verify(id, user);
  }

  @Patch(':id/flag')
  @ApiOperation({ summary: 'Flag a question as incorrect (all logged in users)' })
  @ApiResponse({ status: 200, description: 'Question flagged successfully' })
  async flag(@Param('id') id: string) {
    return this.questionsService.flag(id);
  }
}
