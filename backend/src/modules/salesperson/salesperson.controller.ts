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
import { SalespersonService } from './salesperson.service';
import { CreateSalespersonDto, UpdateSalespersonDto } from './dto/salesperson.dto';

@ApiTags('Salespeople')
@Controller('salespeople')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalespersonController {
  constructor(private readonly salespersonService: SalespersonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new salesperson' })
  @ApiResponse({ status: 201, description: 'Salesperson created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createSalespersonDto: CreateSalespersonDto) {
    return this.salespersonService.create(createSalespersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salespeople with pagination' })
  @ApiResponse({ status: 200, description: 'List of salespeople retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'dealershipId', required: false, example: 'dealership-id-123' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dealershipId') dealershipId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.salespersonService.findAll(pageNum, limitNum, dealershipId);
  }

  @Get('dealership/:dealershipId')
  @ApiOperation({ summary: 'Get salespeople by dealership ID' })
  @ApiResponse({ status: 200, description: 'Dealership salespeople found' })
  findByDealership(@Param('dealershipId') dealershipId: string) {
    return this.salespersonService.findByDealership(dealershipId);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get salesperson by email' })
  @ApiResponse({ status: 200, description: 'Salesperson found' })
  @ApiResponse({ status: 404, description: 'Salesperson not found' })
  findByEmail(@Param('email') email: string) {
    return this.salespersonService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salesperson by ID' })
  @ApiResponse({ status: 200, description: 'Salesperson found' })
  @ApiResponse({ status: 404, description: 'Salesperson not found' })
  findOne(@Param('id') id: string) {
    return this.salespersonService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update salesperson' })
  @ApiResponse({ status: 200, description: 'Salesperson updated successfully' })
  @ApiResponse({ status: 404, description: 'Salesperson not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @Param('id') id: string,
    @Body() updateSalespersonDto: UpdateSalespersonDto,
  ) {
    return this.salespersonService.update(id, updateSalespersonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete salesperson' })
  @ApiResponse({ status: 200, description: 'Salesperson deleted successfully' })
  @ApiResponse({ status: 404, description: 'Salesperson not found' })
  remove(@Param('id') id: string) {
    return this.salespersonService.remove(id);
  }
}