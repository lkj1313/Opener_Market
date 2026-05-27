import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../generated/prisma/enums';

export class UpdateSubOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  shippingCompany?: string;
}
