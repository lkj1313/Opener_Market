export type ProductStatusValue = 'ACTIVE' | 'SOLD_OUT' | 'HIDDEN' | 'BLIND';

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId?: string;
  status?: ProductStatusValue;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface UpdateProductStatusRequest {
  status: ProductStatusValue;
}
