import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { UpdateProductStatusRequest } from '@opener/shared';
import { ProductStatus } from '../../generated/prisma/enums';

export class UpdateProductStatusDto implements UpdateProductStatusRequest {
  @ApiProperty({ example: 'ACTIVE', enum: ProductStatus, description: '상품 상태' })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
