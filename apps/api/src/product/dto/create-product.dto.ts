import { IsString, IsInt, Min, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateProductRequest } from '@opener/shared';
import { ProductStatus } from '../../generated/prisma/enums';

export class CreateProductDto implements CreateProductRequest {
  @ApiProperty({ example: '아이폰 16', description: '상품명' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '최신 아이폰입니다', description: '상품 설명' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 1000000, description: '가격' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: '재고' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 'category-id', description: '카테고리 ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ProductStatus, description: '상품 상태' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
