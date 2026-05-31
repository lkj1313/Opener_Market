import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ description: '주문 아이템 ID' })
  id: string;

  @ApiProperty({ description: '상품명' })
  productName: string;

  @ApiProperty({ description: '가격' })
  price: number;

  @ApiProperty({ description: '수량' })
  quantity: number;
}
