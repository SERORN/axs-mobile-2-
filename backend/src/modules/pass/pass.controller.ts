import { Controller, Post, Get, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PassService } from './pass.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Passes')
@Controller('passes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PassController {
  constructor(private passService: PassService) {}

  @Get()
  @ApiOperation({ summary: 'Get user passes' })
  @ApiResponse({ status: 200, description: 'User passes retrieved' })
  async getUserPasses(@Request() req: any) {
    return this.passService.getUserPasses(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pass by ID' })
  @ApiResponse({ status: 200, description: 'Pass retrieved' })
  async getPass(@Param('id') id: string) {
    return this.passService.getPassById(id);
  }

  @Post(':id/consume')
  @ApiOperation({ summary: 'Consume a pass (scan QR)' })
  @ApiResponse({ status: 200, description: 'Pass consumed successfully' })
  async consumePass(
    @Param('id') passId: string,
    @Request() req: any,
    @Body() consumeData?: { location?: string; metadata?: any }
  ) {
    return this.passService.consumePass(passId, req.user.id, consumeData);
  }
}
