import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { OrderResponseDto } from './order-response.dto';

export class OrderListResponseDto {
  @ApiProperty({ description: '주문 목록', type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ description: '페이지네이션 메타', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
