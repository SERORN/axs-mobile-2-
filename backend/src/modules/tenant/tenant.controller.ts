import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantService } from './tenant.service';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get tenant by slug' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenant(@Param('slug') slug: string) {
    return this.tenantService.getTenantBySlug(slug);
  }
}

@ApiTags('Sites')
@Controller('sites')
export class SiteController {
  constructor(private tenantService: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Get sites for a tenant' })
  @ApiResponse({ status: 200, description: 'Sites retrieved successfully' })
  async getSites(@Param('tenant') tenantId: string) {
    return this.tenantService.getSites(tenantId);
  }
}