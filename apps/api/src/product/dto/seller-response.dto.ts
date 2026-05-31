import { ApiProperty } from '@nestjs/swagger';

export class SellerSummaryDto {
  @ApiProperty({ description: '판매자 ID' })
  id: string;

  @ApiProperty({ description: '상점명' })
  shopName: string;
}
