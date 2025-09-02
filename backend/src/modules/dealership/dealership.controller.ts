import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DealershipService } from './dealership.service';
import { CreateDealershipDto, UpdateDealershipDto } from './dto/dealership.dto';

@ApiTags('Dealerships')
@Controller('dealerships')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DealershipController {
  constructor(private readonly dealershipService: DealershipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dealership' })
  @ApiResponse({ status: 201, description: 'Dealership created successfully' })
  @ApiResponse({ status: 409, description: 'Dealership code already exists' })
  create(@Body() createDealershipDto: CreateDealershipDto) {
    return this.dealershipService.create(createDealershipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dealerships with pagination' })
  @ApiResponse({ status: 200, description: 'List of dealerships retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.dealershipService.findAll(pageNum, limitNum);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get dealership by code' })
  @ApiResponse({ status: 200, description: 'Dealership found' })
  @ApiResponse({ status: 404, description: 'Dealership not found' })
  findByCode(@Param('code') code: string) {
    return this.dealershipService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dealership by ID' })
  @ApiResponse({ status: 200, description: 'Dealership found' })
  @ApiResponse({ status: 404, description: 'Dealership not found' })
  findOne(@Param('id') id: string) {
    return this.dealershipService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dealership' })
  @ApiResponse({ status: 200, description: 'Dealership updated successfully' })
  @ApiResponse({ status: 404, description: 'Dealership not found' })
  update(
    @Param('id') id: string,
    @Body() updateDealershipDto: UpdateDealershipDto,
  ) {
    return this.dealershipService.update(id, updateDealershipDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dealership' })
  @ApiResponse({ status: 200, description: 'Dealership deleted successfully' })
  @ApiResponse({ status: 404, description: 'Dealership not found' })
  remove(@Param('id') id: string) {
    return this.dealershipService.remove(id);
  }
}