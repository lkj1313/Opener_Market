import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import type { CreateShopDiscountRequest } from '@opener/shared';
import { DiscountType } from '../../generated/prisma/enums';

export class CreateShopDiscountDto implements CreateShopDiscountRequest {
  @IsEnum(DiscountType)
  type: DiscountType;

  @IsInt()
  @Min(0)
  value: number;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
