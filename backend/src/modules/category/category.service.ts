import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategorySearchDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(createCategoryDto: CreateCategoryDto, userId: string, userRole: string) {
    const { name, nameI18n, parentId } = createCategoryDto;

    // Only admin can create categories
    if (userRole !== 'ADMIN') {
      throw new BadRequestException('Only admin can create categories');
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    // Check if slug already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new BadRequestException('Category with similar name already exists');
    }

    // Determine level based on parent
    let level = 0;
    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
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

  async getCategories(searchDto: CategorySearchDto = {}) {
    const { q, parentId, level, active = true } = searchDto;

    const where: any = {
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

  async getCategoryById(id: string) {
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
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getCategoryBySlug(slug: string) {
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
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, userId: string, userRole: string) {
    // Only admin can update categories
    if (userRole !== 'ADMIN') {
      throw new BadRequestException('Only admin can update categories');
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Update slug if name changes
    let slug = category.slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      slug = updateCategoryDto.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }

    // Update level if parent changes
    let level = category.level;
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId },
        });

        if (!parent) {
          throw new NotFoundException('Parent category not found');
        }

        level = parent.level + 1;
      } else {
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

  async deleteCategory(id: string, userId: string, userRole: string) {
    // Only admin can delete categories
    if (userRole !== 'ADMIN') {
      throw new BadRequestException('Only admin can delete categories');
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
      throw new NotFoundException('Category not found');
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products. Move products first.');
    }

    // Check if category has children
    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories. Delete subcategories first.');
    }

    // Soft delete by setting active to false
    await this.prisma.category.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Category deleted successfully' };
  }

  async getCategoryHierarchy() {
    // Get all root categories (level 0) with their children
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
}