import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { ProductResponseDto } from './product-response.dto';

export class ProductListResponseDto {
  @ApiProperty({ description: '상품 목록', type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ description: '페이지네이션 메타', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
