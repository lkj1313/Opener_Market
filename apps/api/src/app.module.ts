import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SellerApplicationModule } from './seller-application/seller-application.module';

@Module({
  imports: [PrismaModule, AuthModule, SellerApplicationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
