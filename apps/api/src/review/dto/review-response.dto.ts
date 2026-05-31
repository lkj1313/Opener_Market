import { ApiProperty } from '@nestjs/swagger';
import { ReviewUserDto } from './review-user-response.dto';

export class ReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID' })
  id: string;

  @ApiProperty({ description: '상품 ID' })
  productId: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '주문 아이템 ID' })
  orderItemId: string;

  @ApiProperty({ description: '평점' })
  rating: number;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '숨김 여부' })
  isHidden: boolean;

  @ApiProperty({ description: '작성자 정보', type: ReviewUserDto })
  user: ReviewUserDto;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
