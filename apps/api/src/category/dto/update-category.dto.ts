import { PartialType } from '@nestjs/mapped-types';
import type { UpdateCategoryRequest } from '@opener/shared';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto
  extends PartialType(CreateCategoryDto)
  implements UpdateCategoryRequest {}
