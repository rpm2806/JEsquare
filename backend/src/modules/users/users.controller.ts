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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(page || 1, limit || 20, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Patch(':id/select-role')
  @ApiOperation({ summary: 'Select/confirm user role (can only be done once)' })
  @ApiResponse({ status: 200, description: 'Role selected and locked' })
  async selectRole(
    @Param('id') id: string,
    @Body() dto: { role: string },
    @CurrentUser() user: any,
  ) {
    return this.usersService.selectRole(id, dto.role, user);
  }

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async changePassword(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    if (user.id !== id) {
      throw new ForbiddenException('You can only change your own password');
    }
    return this.usersService.changePassword(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (deactivate) user' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user);
  }

  @Post('add-balance')
  @ApiOperation({ summary: 'Add balance to student account' })
  @ApiResponse({ status: 200, description: 'Balance updated successfully' })
  async addBalance(
    @CurrentUser('id') userId: string,
    @Body() dto: { amount: number },
  ) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }
    return this.usersService.addBalance(userId, dto.amount);
  }
}
