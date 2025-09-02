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
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto, UpdateServiceOrderDto, CreatePaymentIntentForServiceDto } from './dto/service-order.dto';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service order' })
  @ApiResponse({ status: 201, description: 'Service order created successfully' })
  @ApiResponse({ status: 409, description: 'Service order number already exists' })
  create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(createServiceOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service orders with pagination' })
  @ApiResponse({ status: 200, description: 'List of service orders retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.serviceOrderService.findAll(pageNum, limitNum);
  }

  @Get('order/:orderNumber')
  @ApiOperation({ summary: 'Get service order by order number' })
  @ApiResponse({ status: 200, description: 'Service order found' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.serviceOrderService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service order by ID' })
  @ApiResponse({ status: 200, description: 'Service order found' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  findOne(@Param('id') id: string) {
    return this.serviceOrderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service order' })
  @ApiResponse({ status: 200, description: 'Service order updated successfully' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  update(
    @Param('id') id: string,
    @Body() updateServiceOrderDto: UpdateServiceOrderDto,
  ) {
    return this.serviceOrderService.update(id, updateServiceOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service order status' })
  @ApiResponse({ status: 200, description: 'Service order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.serviceOrderService.updateStatus(id, status);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Create Stripe payment intent for service order' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  createPaymentIntent(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentIntentForServiceDto,
  ) {
    return this.serviceOrderService.createPaymentIntent(id, createPaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service order' })
  @ApiResponse({ status: 200, description: 'Service order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  remove(@Param('id') id: string) {
    return this.serviceOrderService.remove(id);
  }
}