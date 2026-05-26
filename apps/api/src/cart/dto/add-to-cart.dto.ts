import { IsString, IsInt, Min } from 'class-validator';
import type { AddToCartRequest } from '@opener/shared';

export class AddToCartDto implements AddToCartRequest {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
