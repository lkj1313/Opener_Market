import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../../generated/prisma/enums';
import { SellerSummaryDto } from './seller-response.dto';
import { DiscountResponseDto } from './discount-response.dto';

export class ProductResponseDto {
  @ApiProperty({ description: '상품 ID' })
  id: string;

  @ApiProperty({ description: '상품명' })
  name: string;

  @ApiProperty({ description: '상품 설명', nullable: true })
  description: string | null;

  @ApiProperty({ description: '가격' })
  price: number;

  @ApiProperty({ description: '재고' })
  stock: number;

  @ApiProperty({ description: '판매량' })
  salesCount: number;

  @ApiProperty({ description: '평점', nullable: true })
  rating: number | null;

  @ApiProperty({ description: '리뷰 수' })
  reviewCount: number;

  @ApiProperty({ description: '상품 상태', enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty({ description: '카테고리 ID', nullable: true })
  categoryId: string | null;

  @ApiProperty({ description: '판매자 ID' })
  sellerId: string;

  @ApiProperty({ description: '판매자 정보', type: SellerSummaryDto })
  seller: SellerSummaryDto;

  @ApiProperty({ description: '할인 정보', type: [DiscountResponseDto] })
  discounts: DiscountResponseDto[];

  @ApiProperty({ description: '할인 적용 가격' })
  discountedPrice: number;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
