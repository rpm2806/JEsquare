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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { JEsquareeratorService } from './test-generator.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { GenerateTestDto } from './dto/generate-test.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tests')
export class TestsController {
  constructor(
    private readonly testsService: TestsService,
    private readonly testGeneratorService: JEsquareeratorService,
    private readonly prisma: PrismaService,
  ) {}

  private async enforceTestLimits(user: any, questionCount = 0) {
    if (user.role === 'STUDENT') {
      if (questionCount > 75) {
        throw new ForbiddenException(
          'Students are limited to a maximum of 75 questions per test.',
        );
      }
      const count = await this.prisma.test.count({
        where: { createdById: user.id },
      });
      if (count >= 2) {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: user.id },
          select: { balance: true },
        });
        if (!dbUser || dbUser.balance < 5) {
          throw new ForbiddenException(
            'Students are limited to exactly 2 free mock tests for self practice. Creating an additional test paper costs ₹5. Insufficient balance! Please add balance to your account.',
          );
        }
        await this.prisma.user.update({
          where: { id: user.id },
          data: { balance: dbUser.balance - 5 },
        });
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Wallet Deduction',
            message: '₹5 deducted from your wallet for custom mock test creation.',
            type: 'WALLET',
          },
        });
      }
    }
    if (user.role === 'TEACHER') {
      const count = await this.prisma.test.count({
        where: { createdById: user.id },
      });
      if (count >= 1) {
        throw new ForbiddenException(
          'Teachers are limited to generating exactly 1 test. Upgrade to Institute tier for more.',
        );
      }
    }
    if (user.role === 'INSTITUTE_ADMIN') {
      const count = await this.prisma.test.count({
        where: { createdById: user.id },
      });
      if (count >= 10) {
        throw new ForbiddenException(
          'Institutes are limited to generating exactly 10 tests. Upgrade to Pro/Enterprise for more.',
        );
      }
    }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Create a new test manually' })
  @ApiResponse({ status: 201, description: 'Test created' })
  async create(@Body() dto: CreateTestDto, @CurrentUser() user: any) {
    await this.enforceTestLimits(user, dto.questionIds?.length || 0);
    return this.testsService.create(dto, user.id);
  }

  @Post('generate')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Generate a test dynamically from question pool' })
  @ApiResponse({ status: 201, description: 'Test generated' })
  async generate(
    @Body() dto: GenerateTestDto,
    @CurrentUser() user: any,
  ) {
    const totalQCount = dto.sections?.reduce((acc, sec) => acc + (sec.questionCount || 0), 0) || 0;
    await this.enforceTestLimits(user, totalQCount);
    return this.testGeneratorService.generateTest(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List tests' })
  @ApiQuery({ name: 'instituteId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated test list' })
  async findAll(
    @CurrentUser('role') role: string,
    @Query('instituteId') instituteId?: string,
    @Query('type') type?: string,
    @Query('isPublished') isPublished?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.testsService.findAll({ instituteId, type, isPublished, page, limit }, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test by ID with questions' })
  @ApiResponse({ status: 200, description: 'Test details with questions' })
  async findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update test' })
  @ApiResponse({ status: 200, description: 'Test updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
    @CurrentUser() user: any,
  ) {
    return this.testsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Delete test' })
  @ApiResponse({ status: 200, description: 'Test deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.testsService.remove(id, user);
  }

  @Post(':id/publish')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Publish a test' })
  @ApiResponse({ status: 200, description: 'Test published' })
  async publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.testsService.publish(id, user);
  }

  @Post(':id/unpublish')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Unpublish a test' })
  @ApiResponse({ status: 200, description: 'Test unpublished' })
  async unpublish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.testsService.unpublish(id, user);
  }
}
