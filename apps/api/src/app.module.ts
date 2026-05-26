import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SellerApplicationModule } from './seller-application/seller-application.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ShopDiscountModule } from './shop-discount/shop-discount.module';

@Module({
  imports: [PrismaModule, AuthModule, SellerApplicationModule, UserModule, ProductModule, ShopDiscountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
