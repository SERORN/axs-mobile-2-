import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FlowService } from './flow.service';

@ApiTags('Flows')
@Controller('flows')
export class FlowController {
  constructor(private flowService: FlowService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get flow by ID' })
  @ApiResponse({ status: 200, description: 'Flow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Flow not found' })
  async getFlow(@Param('id') id: string) {
    return this.flowService.getFlowById(id);
  }

  @Get('by-access-point/:publicId')
  @ApiOperation({ summary: 'Get flow by access point public ID' })
  @ApiResponse({ status: 200, description: 'Flow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Access point not found' })
  async getFlowByAccessPoint(@Param('publicId') publicId: string) {
    return this.flowService.getFlowByAccessPoint(publicId);
  }

  @Get()
  @ApiOperation({ summary: 'List flows' })
  @ApiResponse({ status: 200, description: 'Flows retrieved successfully' })
  async listFlows(@Query('tenantId') tenantId: string) {
    return this.flowService.listFlows(tenantId);
  }
}