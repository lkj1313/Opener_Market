import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'order-item-id', description: '주문 아이템 ID' })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({ example: 5, description: '별점 (1~5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: '좋은 상품입니다', description: '리뷰 내용' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  content: string;
}
