import { Module } from '@nestjs/common';
import { SellerApplicationService } from './seller-application.service';
import { SellerApplicationController } from './seller-application.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerApplicationController],
  providers: [SellerApplicationService],
})
export class SellerApplicationModule {}
