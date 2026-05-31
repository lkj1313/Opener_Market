import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateShopDiscountRequest } from '@opener/shared';
import { DiscountType } from '../../generated/prisma/enums';

export class CreateShopDiscountDto implements CreateShopDiscountRequest {
  @ApiProperty({ example: 'PERCENTAGE', enum: DiscountType, description: '할인 유형' })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({ example: 10, description: '할인 값 (퍼센트 또는 고정 금액)' })
  @IsInt()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z', description: '시작일 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z', description: '종료일 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ example: true, description: '활성화 여부' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
