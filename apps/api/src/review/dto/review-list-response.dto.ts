import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { ReviewResponseDto } from './review-response.dto';

export class ReviewListResponseDto {
  @ApiProperty({ description: '리뷰 목록', type: [ReviewResponseDto] })
  data: ReviewResponseDto[];

  @ApiProperty({ description: '페이지네이션 메타', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
