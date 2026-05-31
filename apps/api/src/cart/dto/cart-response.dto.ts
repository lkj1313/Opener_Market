import { ApiProperty } from '@nestjs/swagger';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartResponseDto {
  @ApiProperty({ description: '장바구니 ID' })
  id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '장바구니 아이템 목록', type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
