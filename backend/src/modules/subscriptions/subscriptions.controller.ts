import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'List of plans with features and pricing' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a subscription (stubbed payment)' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(dto);
  }

  @Get(':instituteId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription for an institute' })
  @ApiResponse({ status: 200, description: 'Current subscription details' })
  async getSubscription(@Param('instituteId') instituteId: string) {
    return this.subscriptionsService.getSubscription(instituteId);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(id);
  }
}
