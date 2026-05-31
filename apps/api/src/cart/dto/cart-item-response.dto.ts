import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../product/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty({ description: '장바구니 아이템 ID' })
  id: string;

  @ApiProperty({ description: '장바구니 ID' })
  cartId: string;

  @ApiProperty({ description: '상품 ID' })
  productId: string;

  @ApiProperty({ description: '수량' })
  quantity: number;

  @ApiProperty({ description: '상품 정보', type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
