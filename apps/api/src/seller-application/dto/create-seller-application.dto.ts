import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import type { CreateSellerApplicationRequest } from '@opener/shared';

export class CreateSellerApplicationDto implements CreateSellerApplicationRequest {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shopName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  businessAddress: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  returnAddress?: string;
}
