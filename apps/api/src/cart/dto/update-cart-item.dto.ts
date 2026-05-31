import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { UpdateCartItemRequest } from '@opener/shared';

export class UpdateCartItemDto implements UpdateCartItemRequest {
  @ApiProperty({ example: 2, description: '수량' })
  @IsInt()
  @Min(1)
  quantity: number;
}
