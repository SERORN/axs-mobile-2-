import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, ProductSearchDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async searchProducts(searchDto: ProductSearchDto, userId?: string, userRole?: string) {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      requiresQuote,
      page = 1,
      limit = 20,
      role
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      active: true,
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(category && { categoryId: category }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(requiresQuote !== undefined && { requiresQuote }),
    };

    // Price filtering on variants
    const variantWhere: any = {};
    if (minPrice !== undefined || maxPrice !== undefined) {
      variantWhere.priceBase = {};
      if (minPrice !== undefined) variantWhere.priceBase.gte = minPrice;
      if (maxPrice !== undefined) variantWhere.priceBase.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          provider: true,
          variants: {
            where: variantWhere,
            orderBy: { priceBase: 'asc' },
            take: 1, // Get cheapest variant for display
          },
          reviews: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { reviews: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const avgRating = await this.prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        });

        return {
          ...product,
          avgRating: avgRating._avg.rating || 0,
          reviewCount: product._count.reviews,
        };
      })
    );

    return {
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string, userRole?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        provider: true,
        variants: {
          include: {
            priceTiers: true,
          },
          orderBy: { priceBase: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Calculate average rating
    const avgRating = await this.prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
    });

    return {
      ...product,
      avgRating: avgRating._avg.rating || 0,
      reviewCount: product._count.reviews,
    };
  }

  async createProduct(createProductDto: CreateProductDto, userId: string) {
    // Get user and verify they are a provider
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user || user.role !== 'PROVIDER' || !user.organization) {
      throw new ForbiddenException('Only providers can create products');
    }

    // Generate slug from name
    const slug = createProductDto.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    // Check if slug already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new BadRequestException('Product with similar name already exists');
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        slug,
        providerId: user.organization.id,
      },
      include: {
        category: true,
        provider: true,
      },
    });

    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, userId: string) {
    // Verify ownership
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { provider: { include: { users: true } } },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isOwner = product.provider.users.some(user => user.id === userId);
    if (!isOwner) {
      throw new ForbiddenException('Not authorized to update this product');
    }

    // Update slug if name changes
    let slug = product.slug;
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      slug = updateProductDto.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        slug,
      },
      include: {
        category: true,
        provider: true,
        variants: true,
      },
    });

    return updatedProduct;
  }

  async deleteProduct(id: string, userId: string) {
    // Verify ownership
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { provider: { include: { users: true } } },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isOwner = product.provider.users.some(user => user.id === userId);
    if (!isOwner) {
      throw new ForbiddenException('Not authorized to delete this product');
    }

    // Soft delete by setting active to false
    await this.prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Product deleted successfully' };
  }

  async createVariant(productId: string, createVariantDto: CreateVariantDto, userId: string) {
    // Verify product ownership
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { provider: { include: { users: true } } },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isOwner = product.provider.users.some(user => user.id === userId);
    if (!isOwner) {
      throw new ForbiddenException('Not authorized to create variants for this product');
    }

    const variant = await this.prisma.variant.create({
      data: {
        ...createVariantDto,
        productId,
      },
    });

    return variant;
  }

  async getVariantsByProduct(productId: string) {
    const variants = await this.prisma.variant.findMany({
      where: { 
        productId,
        active: true,
      },
      include: {
        priceTiers: true,
      },
      orderBy: { priceBase: 'asc' },
    });

    return variants;
  }
}