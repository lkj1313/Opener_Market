import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AddToCartRequest } from '@opener/shared';

export class AddToCartDto implements AddToCartRequest {
  @ApiProperty({ example: 'product-id', description: '상품 ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 1, description: '수량' })
  @IsInt()
  @Min(1)
  quantity: number;
}
