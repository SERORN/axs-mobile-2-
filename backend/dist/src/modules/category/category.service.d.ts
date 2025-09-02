import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategorySearchDto } from './dto/category.dto';
export declare class CategoryService {
    private prisma;
    constructor(prisma: PrismaService);
    createCategory(createCategoryDto: CreateCategoryDto, userId: string, userRole: string): Promise<any>;
    getCategories(searchDto?: CategorySearchDto): Promise<any>;
    getCategoryById(id: string): Promise<any>;
    getCategoryBySlug(slug: string): Promise<any>;
    updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, userId: string, userRole: string): Promise<any>;
    deleteCategory(id: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    getCategoryHierarchy(): Promise<any>;
}
