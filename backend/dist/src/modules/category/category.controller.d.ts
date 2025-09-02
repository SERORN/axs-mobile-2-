import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategorySearchDto } from './dto/category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    getCategories(searchDto: CategorySearchDto): Promise<any>;
    getCategoryHierarchy(): Promise<any>;
    getCategoryById(id: string): Promise<any>;
    getCategoryBySlug(slug: string): Promise<any>;
    createCategory(createCategoryDto: CreateCategoryDto, req: any): Promise<any>;
    updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, req: any): Promise<any>;
    deleteCategory(id: string, req: any): Promise<{
        message: string;
    }>;
}
