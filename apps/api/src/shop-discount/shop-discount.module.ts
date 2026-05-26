import { Module } from '@nestjs/common';
import { ShopDiscountService } from './shop-discount.service';
import { ShopDiscountController } from './shop-discount.controller';

@Module({
  controllers: [ShopDiscountController],
  providers: [ShopDiscountService],
})
export class ShopDiscountModule {}
