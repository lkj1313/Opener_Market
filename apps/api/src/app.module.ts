import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { SellerApplicationModule } from './seller-application/seller-application.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ShopDiscountModule } from './shop-discount/shop-discount.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { WalletModule } from './wallet/wallet.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, RedisModule, AuthModule, SellerApplicationModule, UserModule, ProductModule, ShopDiscountModule, CartModule, CategoryModule, OrderModule, WalletModule, ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
