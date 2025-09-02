export declare class CreateProductDto {
    name: string;
    descriptionI18n: object;
    categoryId: string;
    brand?: string;
    sku?: string;
    barcode?: string;
    attributes?: object;
    images?: string[];
    requiresQuote?: boolean;
}
export declare class UpdateProductDto {
    name?: string;
    descriptionI18n?: object;
    categoryId?: string;
    brand?: string;
    attributes?: object;
    images?: string[];
    requiresQuote?: boolean;
    active?: boolean;
}
export declare class CreateVariantDto {
    options: object;
    priceBase: number;
    currency?: string;
    weight?: number;
    dimensions?: object;
    stock?: number;
    minQty?: number;
}
export declare class ProductSearchDto {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    requiresQuote?: boolean;
    page?: number;
    limit?: number;
    role?: string;
}
