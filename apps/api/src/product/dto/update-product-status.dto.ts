import { IsEnum } from 'class-validator';
import type { UpdateProductStatusRequest } from '@opener/shared';
import { ProductStatus } from '../../generated/prisma/enums';

export class UpdateProductStatusDto implements UpdateProductStatusRequest {
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
