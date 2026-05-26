import { PartialType } from '@nestjs/mapped-types';
import type { UpdateProductRequest } from '@opener/shared';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto
  extends PartialType(CreateProductDto)
  implements UpdateProductRequest {}
