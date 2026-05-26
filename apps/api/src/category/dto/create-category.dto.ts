import { IsString, IsOptional, MinLength } from 'class-validator';
import type { CreateCategoryRequest } from '@opener/shared';

export class CreateCategoryDto implements CreateCategoryRequest {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
