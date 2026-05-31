import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '../../generated/prisma/enums';

export class DiscountResponseDto {
  @ApiProperty({ description: '할인 ID' })
  id: string;

  @ApiProperty({ description: '상품 ID' })
  productId: string;

  @ApiProperty({ description: '할인 타입', enum: DiscountType })
  type: DiscountType;

  @ApiProperty({ description: '할인 값' })
  value: number;

  @ApiProperty({ description: '시작일', type: 'string', format: 'date-time', nullable: true })
  startAt: Date | null;

  @ApiProperty({ description: '종료일', type: 'string', format: 'date-time', nullable: true })
  endAt: Date | null;

  @ApiProperty({ description: '활성화 여부' })
  isActive: boolean;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
