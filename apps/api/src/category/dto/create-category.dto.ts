import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateCategoryRequest } from '@opener/shared';

export class CreateCategoryDto implements CreateCategoryRequest {
  @ApiProperty({ example: '전자제품', description: '카테고리명' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'electronics', description: 'URL 슬러그' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiPropertyOptional({ example: 'parent-category-id', description: '부모 카테고리 ID' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
