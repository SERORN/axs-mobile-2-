import { Controller, Post, Get, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VisitService } from './visit.service';
import { CheckinDto, CheckoutDto } from './dto/visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Visits')
@Controller('visits')
export class VisitController {
  constructor(private visitService: VisitService) {}

  @Post('checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in to an access point' })
  @ApiResponse({ 
    status: 201, 
    description: 'Visit created successfully',
    schema: {
      example: {
        visitId: 'clx123...',
        status: 'CHECKED_IN',
        requiredPayment: { amount: 25, currency: 'MXN' },
        paymentSheetClientSecret: 'pi_...'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Access point not found' })
  async checkin(@Request() req, @Body() checkinDto: CheckinDto) {
    const userId = req.user?.sub || req.user?.id;
    return this.visitService.checkin(userId, checkinDto);
  }

  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check out from a visit' })
  @ApiResponse({ status: 200, description: 'Visit checked out successfully' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async checkout(
    @Param('id') id: string, 
    @Body() checkoutDto: CheckoutDto,
    @Request() req
  ) {
    const operatorId = req.user?.operatorId; // Optional operator ID
    return this.visitService.checkout(id, checkoutDto, operatorId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get visit by ID' })
  @ApiResponse({ status: 200, description: 'Visit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async getVisit(@Param('id') id: string) {
    return this.visitService.getVisit(id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a pending visit (operator only)' })
  @ApiResponse({ status: 200, description: 'Visit approved successfully' })
  async approveVisit(@Param('id') id: string, @Request() req) {
    const operatorId = req.user?.operatorId || req.user?.sub;
    return this.visitService.approveVisit(id, operatorId);
  }

  @Post(':id/deny')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deny a pending visit (operator only)' })
  @ApiResponse({ status: 200, description: 'Visit denied successfully' })
  async denyVisit(
    @Param('id') id: string, 
    @Body() body: { reason?: string },
    @Request() req
  ) {
    const operatorId = req.user?.operatorId || req.user?.sub;
    return this.visitService.denyVisit(id, operatorId, body.reason);
  }
}

@ApiTags('Queue Management')
@Controller('queue')
export class QueueController {
  constructor(private visitService: VisitService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get visit queue for operators' })
  @ApiResponse({ 
    status: 200, 
    description: 'Queue retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          checkinAt: { type: 'string' },
          user: { type: 'object' },
          vehicle: { type: 'object' },
          accessPoint: { type: 'object' },
        }
      }
    }
  })
  async getQueue(
    @Query('site') siteId?: string,
    @Query('state') state?: string
  ) {
    const states = state ? state.split(',') : undefined;
    return this.visitService.getQueue(siteId, states);
  }
}