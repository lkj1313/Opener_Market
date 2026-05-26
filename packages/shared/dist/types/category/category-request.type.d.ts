export interface CreateCategoryRequest {
    name: string;
    slug: string;
    parentId?: string;
}
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
