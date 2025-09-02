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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto, UpdatePurchaseDto, CreateOwnershipDto } from './dto/purchase.dto';

@ApiTags('Purchases')
@Controller('purchases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase (creates ownership history automatically)' })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.create(createPurchaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases with pagination' })
  @ApiResponse({ status: 200, description: 'List of purchases retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.purchaseService.findAll(pageNum, limitNum);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get purchases by vehicle ID' })
  @ApiResponse({ status: 200, description: 'Vehicle purchases found' })
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.purchaseService.findByVehicle(vehicleId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get purchases by customer ID' })
  @ApiResponse({ status: 200, description: 'Customer purchases found' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.purchaseService.findByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID' })
  @ApiResponse({ status: 200, description: 'Purchase found' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update purchase' })
  @ApiResponse({ status: 200, description: 'Purchase updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete purchase' })
  @ApiResponse({ status: 200, description: 'Purchase deleted successfully' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(id);
  }
}

@ApiTags('Vehicle Ownership')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehicleOwnershipController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post(':id/purchases')
  @ApiOperation({ summary: 'Create purchase for vehicle (creates ownership history)' })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  createPurchase(
    @Param('id') vehicleId: string,
    @Body() createPurchaseDto: Omit<CreatePurchaseDto, 'vehicleId'>,
  ) {
    return this.purchaseService.create({ ...createPurchaseDto, vehicleId });
  }

  @Get(':id/ownerships')
  @ApiOperation({ summary: 'Get complete ownership history for vehicle' })
  @ApiResponse({ status: 200, description: 'Ownership history retrieved successfully' })
  getOwnershipHistory(@Param('id') vehicleId: string) {
    return this.purchaseService.getOwnershipHistory(vehicleId);
  }

  @Post(':id/ownerships')
  @ApiOperation({ summary: 'Add new ownership record (closes current ownership)' })
  @ApiResponse({ status: 201, description: 'Ownership record created successfully' })
  addOwnership(
    @Param('id') vehicleId: string,
    @Body() createOwnershipDto: CreateOwnershipDto,
  ) {
    return this.purchaseService.addOwnership(vehicleId, createOwnershipDto);
  }
}