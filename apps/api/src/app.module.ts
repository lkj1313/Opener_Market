import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SellerApplicationModule } from './seller-application/seller-application.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ShopDiscountModule } from './shop-discount/shop-discount.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [PrismaModule, AuthModule, SellerApplicationModule, UserModule, ProductModule, ShopDiscountModule, CartModule, CategoryModule, OrderModule, WalletModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
