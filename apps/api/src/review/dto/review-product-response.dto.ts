import { ApiProperty } from '@nestjs/swagger';

export class ReviewProductDto {
  @ApiProperty({ description: '상품명' })
  name: string;
}
