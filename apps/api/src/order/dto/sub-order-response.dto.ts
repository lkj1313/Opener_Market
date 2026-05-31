import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../generated/prisma/enums';
import { OrderItemResponseDto } from './order-item-response.dto';

export class SubOrderSellerDto {
  @ApiProperty({ description: '상점명' })
  shopName: string;
}

export class SubOrderResponseDto {
  @ApiProperty({ description: 'SubOrder ID' })
  id: string;

  @ApiProperty({ description: '주문 ID' })
  orderId: string;

  @ApiProperty({ description: '판매자 ID' })
  sellerId: string;

  @ApiProperty({ description: '주문 상태', enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ description: '총 금액' })
  totalAmount: number;

  @ApiProperty({ description: '배송비' })
  shippingFee: number;

  @ApiProperty({ description: '운송장 번호', nullable: true })
  trackingNumber: string | null;

  @ApiProperty({ description: '택배사', nullable: true })
  shippingCompany: string | null;

  @ApiProperty({ description: '발송일', type: 'string', format: 'date-time', nullable: true })
  shippedAt: Date | null;

  @ApiProperty({ description: '배송 완료일', type: 'string', format: 'date-time', nullable: true })
  deliveredAt: Date | null;

  @ApiProperty({ description: '구매 확정일', type: 'string', format: 'date-time', nullable: true })
  confirmedAt: Date | null;

  @ApiProperty({ description: '정산 완료 여부' })
  isSettled: boolean;

  @ApiProperty({ description: '자동 확정 여부' })
  isAutoConfirmed: boolean;

  @ApiProperty({ description: '판매자 정보', type: SubOrderSellerDto })
  seller: SubOrderSellerDto;

  @ApiProperty({ description: '주문 아이템 목록', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;
}
