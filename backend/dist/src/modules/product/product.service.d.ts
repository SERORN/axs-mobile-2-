import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, ProductSearchDto } from './dto/product.dto';
export declare class ProductService {
    private prisma;
    constructor(prisma: PrismaService);
    searchProducts(searchDto: ProductSearchDto, userId?: string, userRole?: string): Promise<{
        products: any[];
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    }>;
    getProductById(id: string, userRole?: string): Promise<any>;
    createProduct(createProductDto: CreateProductDto, userId: string): Promise<any>;
    updateProduct(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<any>;
    deleteProduct(id: string, userId: string): Promise<{
        message: string;
    }>;
    createVariant(productId: string, createVariantDto: CreateVariantDto, userId: string): Promise<any>;
    getVariantsByProduct(productId: string): Promise<any>;
}
