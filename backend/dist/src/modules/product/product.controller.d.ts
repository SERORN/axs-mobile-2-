import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, ProductSearchDto } from './dto/product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    searchProducts(searchDto: ProductSearchDto, req: any): Promise<{
        products: any[];
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    }>;
    getProductById(id: string, req: any): Promise<any>;
    createProduct(createProductDto: CreateProductDto, req: any): Promise<any>;
    updateProduct(id: string, updateProductDto: UpdateProductDto, req: any): Promise<any>;
    deleteProduct(id: string, req: any): Promise<{
        message: string;
    }>;
    getVariantsByProduct(productId: string): Promise<any>;
    createVariant(productId: string, createVariantDto: CreateVariantDto, req: any): Promise<any>;
}
