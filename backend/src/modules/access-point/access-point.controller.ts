import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessPointService } from './access-point.service';

@ApiTags('Access Points')
@Controller('access-points')
export class AccessPointController {
  constructor(private accessPointService: AccessPointService) {}

  @Get(':publicId')
  @ApiOperation({ summary: 'Get access point by public ID' })
  @ApiResponse({ status: 200, description: 'Access point retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Access point not found' })
  async getAccessPoint(@Param('publicId') publicId: string) {
    return this.accessPointService.getAccessPointByPublicId(publicId);
  }

  @Get()
  @ApiOperation({ summary: 'List access points' })
  @ApiResponse({ status: 200, description: 'Access points retrieved successfully' })
  async listAccessPoints(@Query('siteId') siteId?: string) {
    return this.accessPointService.listAccessPoints(siteId);
  }
}