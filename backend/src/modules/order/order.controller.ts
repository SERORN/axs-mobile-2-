import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { AddToCartDto, UpdateCartItemDto, CreateOrderDto, UpdateOrderStatusDto, OrderSearchDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orders & Cart')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ===== CART ENDPOINTS =====

  @Get('cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Req() req: any) {
    return this.orderService.getOrCreateCart(req.user.id);
  }

  @Post('cart/add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or insufficient stock' })
  async addToCart(@Body() addToCartDto: AddToCartDto, @Req() req: any) {
    return this.orderService.addToCart(addToCartDto, req.user.id);
  }

  @Put('cart/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this cart item' })
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
    @Req() req: any,
  ) {
    return this.orderService.updateCartItem(itemId, updateDto, req.user.id);
  }

  @Delete('cart/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to remove this cart item' })
  async removeCartItem(@Param('itemId') itemId: string, @Req() req: any) {
    return this.orderService.removeCartItem(itemId, req.user.id);
  }

  @Delete('cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Req() req: any) {
    return this.orderService.clearCart(req.user.id);
  }

  // ===== ORDER ENDPOINTS =====

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or empty cart' })
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.orderService.createOrder(createOrderDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders with filters' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(@Query() searchDto: OrderSearchDto, @Req() req: any) {
    return this.orderService.getOrders(searchDto, req.user.id, req.user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.orderService.getOrderById(id, req.user.id, req.user.role);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Seller only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.orderService.updateOrderStatus(id, updateDto, req.user.id, req.user.role);
  }
}