export declare class CreateCategoryDto {
    name: string;
    nameI18n: object;
    parentId?: string;
}
export declare class UpdateCategoryDto {
    name?: string;
    nameI18n?: object;
    parentId?: string;
    active?: boolean;
}
export declare class CategorySearchDto {
    q?: string;
    parentId?: string;
    level?: number;
    active?: boolean;
}
