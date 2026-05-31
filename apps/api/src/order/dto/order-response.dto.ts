import { ApiProperty } from '@nestjs/swagger';
import { SubOrderResponseDto } from './sub-order-response.dto';

export class OrderResponseDto {
  @ApiProperty({ description: '주문 ID' })
  id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '배송 주소' })
  address: string;

  @ApiProperty({ description: 'SubOrder 목록', type: [SubOrderResponseDto] })
  items: SubOrderResponseDto[];

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
