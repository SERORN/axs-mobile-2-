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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let CategoryService = class CategoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(createCategoryDto, userId, userRole) {
        const { name, nameI18n, parentId } = createCategoryDto;
        if (userRole !== 'ADMIN') {
            throw new common_1.BadRequestException('Only admin can create categories');
        }
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        const existingCategory = await this.prisma.category.findUnique({
            where: { slug },
        });
        if (existingCategory) {
            throw new common_1.BadRequestException('Category with similar name already exists');
        }
        let level = 0;
        if (parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Parent category not found');
            }
            level = parent.level + 1;
        }
        const category = await this.prisma.category.create({
            data: {
                name,
                nameI18n,
                slug,
                parentId,
                level,
            },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });
        return category;
    }
    async getCategories(searchDto = {}) {
        const { q, parentId, level, active = true } = searchDto;
        const where = {
            active,
            ...(q && {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { slug: { contains: q, mode: 'insensitive' } },
                ],
            }),
            ...(parentId !== undefined && { parentId }),
            ...(level !== undefined && { level }),
        };
        const categories = await this.prisma.category.findMany({
            where,
            include: {
                parent: true,
                children: {
                    where: { active: true },
                    orderBy: { name: 'asc' },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: [
                { level: 'asc' },
                { name: 'asc' },
            ],
        });
        return categories;
    }
    async getCategoryById(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    where: { active: true },
                    orderBy: { name: 'asc' },
                },
                products: {
                    where: { active: true },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        variants: {
                            take: 1,
                            orderBy: { priceBase: 'asc' },
                        },
                    },
                },
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async getCategoryBySlug(slug) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: {
                    where: { active: true },
                    orderBy: { name: 'asc' },
                },
                products: {
                    where: { active: true },
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        variants: {
                            take: 1,
                            orderBy: { priceBase: 'asc' },
                        },
                        provider: true,
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async updateCategory(id, updateCategoryDto, userId, userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.BadRequestException('Only admin can update categories');
        }
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        let slug = category.slug;
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            slug = updateCategoryDto.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');
        }
        let level = category.level;
        if (updateCategoryDto.parentId !== undefined) {
            if (updateCategoryDto.parentId) {
                const parent = await this.prisma.category.findUnique({
                    where: { id: updateCategoryDto.parentId },
                });
                if (!parent) {
                    throw new common_1.NotFoundException('Parent category not found');
                }
                level = parent.level + 1;
            }
            else {
                level = 0;
            }
        }
        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data: {
                ...updateCategoryDto,
                slug,
                level,
            },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });
        return updatedCategory;
    }
    async deleteCategory(id, userId, userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.BadRequestException('Only admin can delete categories');
        }
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category._count.products > 0) {
            throw new common_1.BadRequestException('Cannot delete category with products. Move products first.');
        }
        if (category.children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with subcategories. Delete subcategories first.');
        }
        await this.prisma.category.update({
            where: { id },
            data: { active: false },
        });
        return { message: 'Category deleted successfully' };
    }
    async getCategoryHierarchy() {
        const rootCategories = await this.prisma.category.findMany({
            where: {
                level: 0,
                active: true,
            },
            include: {
                children: {
                    where: { active: true },
                    include: {
                        children: {
                            where: { active: true },
                            include: {
                                _count: {
                                    select: { products: true },
                                },
                            },
                        },
                        _count: {
                            select: { products: true },
                        },
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
        return rootCategories;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoryService);
//# sourceMappingURL=category.service.js.map