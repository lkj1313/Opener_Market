import { IsString, IsInt, Min, MaxLength, IsOptional, IsEnum } from 'class-validator';
import type { CreateProductRequest } from '@opener/shared';
import { ProductStatus } from '../../generated/prisma/enums';

export class CreateProductDto implements CreateProductRequest {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
