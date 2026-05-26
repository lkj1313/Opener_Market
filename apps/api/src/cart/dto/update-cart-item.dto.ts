import { IsInt, Min } from 'class-validator';
import type { UpdateCartItemRequest } from '@opener/shared';

export class UpdateCartItemDto implements UpdateCartItemRequest {
  @IsInt()
  @Min(1)
  quantity: number;
}
