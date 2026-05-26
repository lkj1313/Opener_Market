import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { DiscountType } from '../../generated/prisma/enums';

export class CreateShopDiscountDto {
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
