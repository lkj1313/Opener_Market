import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { AdminReviewResponseDto } from './admin-review-response.dto';

export class AdminReviewListResponseDto {
  @ApiProperty({ description: '리뷰 목록', type: [AdminReviewResponseDto] })
  data: AdminReviewResponseDto[];

  @ApiProperty({ description: '페이지네이션 메타', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
