import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InstitutesService } from './institutes.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Institutes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('institutes')
export class InstitutesController {
  constructor(private readonly institutesService: InstitutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new institute' })
  @ApiResponse({ status: 201, description: 'Institute created' })
  async create(@Body() dto: CreateInstituteDto, @CurrentUser('id') userId: string) {
    return this.institutesService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all institutes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated institute list' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.institutesService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get institute by ID' })
  @ApiResponse({ status: 200, description: 'Institute details' })
  async findOne(@Param('id') id: string) {
    return this.institutesService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @ApiOperation({ summary: 'Update institute' })
  @ApiResponse({ status: 200, description: 'Institute updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInstituteDto,
    @CurrentUser() user: any,
  ) {
    return this.institutesService.update(id, dto, user);
  }

  @Post(':id/batches')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create a batch for the institute' })
  @ApiResponse({ status: 201, description: 'Batch created' })
  async createBatch(
    @Param('id') id: string,
    @Body() dto: CreateBatchDto,
    @CurrentUser() user: any,
  ) {
    return this.institutesService.createBatch(id, dto, user);
  }

  @Get(':id/batches')
  @ApiOperation({ summary: 'List batches for an institute' })
  @ApiResponse({ status: 200, description: 'List of batches' })
  async getBatches(@Param('id') id: string) {
    return this.institutesService.getBatches(id);
  }

  @Post(':id/members')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @ApiOperation({ summary: 'Add a member to the institute' })
  @ApiResponse({ status: 201, description: 'Member added' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.institutesService.addMember(id, dto, user);
  }

  @Get(':id/activity')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get institute recent activities' })
  @ApiResponse({ status: 200, description: 'Chronological activity logs' })
  async getInstituteActivity(@Param('id') id: string) {
    return this.institutesService.getInstituteActivity(id);
  }
}
