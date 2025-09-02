"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let ProductService = class ProductService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchProducts(searchDto, userId, userRole) {
        const { q, category, brand, minPrice, maxPrice, requiresQuote, page = 1, limit = 20, role } = searchDto;
        const skip = (page - 1) * limit;
        const where = {
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
        const variantWhere = {};
        if (minPrice !== undefined || maxPrice !== undefined) {
            variantWhere.priceBase = {};
            if (minPrice !== undefined)
                variantWhere.priceBase.gte = minPrice;
            if (maxPrice !== undefined)
                variantWhere.priceBase.lte = maxPrice;
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
                        take: 1,
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
        const productsWithRatings = await Promise.all(products.map(async (product) => {
            const avgRating = await this.prisma.review.aggregate({
                where: { productId: product.id },
                _avg: { rating: true },
            });
            return {
                ...product,
                avgRating: avgRating._avg.rating || 0,
                reviewCount: product._count.reviews,
            };
        }));
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
    async getProductById(id, userRole) {
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
            throw new common_1.NotFoundException('Product not found');
        }
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
    async createProduct(createProductDto, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user || user.role !== 'PROVIDER' || !user.organization) {
            throw new common_1.ForbiddenException('Only providers can create products');
        }
        const slug = createProductDto.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        const existingProduct = await this.prisma.product.findUnique({
            where: { slug },
        });
        if (existingProduct) {
            throw new common_1.BadRequestException('Product with similar name already exists');
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
    async updateProduct(id, updateProductDto, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { provider: { include: { users: true } } },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const isOwner = product.provider.users.some(user => user.id === userId);
        if (!isOwner) {
            throw new common_1.ForbiddenException('Not authorized to update this product');
        }
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
    async deleteProduct(id, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { provider: { include: { users: true } } },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const isOwner = product.provider.users.some(user => user.id === userId);
        if (!isOwner) {
            throw new common_1.ForbiddenException('Not authorized to delete this product');
        }
        await this.prisma.product.update({
            where: { id },
            data: { active: false },
        });
        return { message: 'Product deleted successfully' };
    }
    async createVariant(productId, createVariantDto, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { provider: { include: { users: true } } },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const isOwner = product.provider.users.some(user => user.id === userId);
        if (!isOwner) {
            throw new common_1.ForbiddenException('Not authorized to create variants for this product');
        }
        const variant = await this.prisma.variant.create({
            data: {
                ...createVariantDto,
                productId,
            },
        });
        return variant;
    }
    async getVariantsByProduct(productId) {
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
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map