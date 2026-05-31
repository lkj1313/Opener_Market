import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../generated/prisma/enums';

export class UpdateSubOrderStatusDto {
  @ApiProperty({ example: 'SHIPPED', enum: OrderStatus, description: '주문 상태' })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ example: '1234567890', description: '운송장 번호' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'CJ대한통운', description: '택배사' })
  @IsOptional()
  @IsString()
  shippingCompany?: string;
}
