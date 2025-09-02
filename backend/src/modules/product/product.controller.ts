import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, ProductSearchDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Search products with filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async searchProducts(@Query() searchDto: ProductSearchDto, @Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    return this.productService.searchProducts(searchDto, userId, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user?.role;
    return this.productService.getProductById(id, userRole);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Provider only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to create products' })
  async createProduct(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    return this.productService.createProduct(createProductDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Product owner only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productService.updateProduct(id, updateProductDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Product owner only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id') id: string, @Req() req: any) {
    return this.productService.deleteProduct(id, req.user.id);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get product variants' })
  @ApiResponse({ status: 200, description: 'Variants retrieved successfully' })
  async getVariantsByProduct(@Param('id') productId: string) {
    return this.productService.getVariantsByProduct(productId);
  }

  @Post(':id/variants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product variant (Product owner only)' })
  @ApiResponse({ status: 201, description: 'Variant created successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to create variants for this product' })
  async createVariant(
    @Param('id') productId: string,
    @Body() createVariantDto: CreateVariantDto,
    @Req() req: any,
  ) {
    return this.productService.createVariant(productId, createVariantDto, req.user.id);
  }
}