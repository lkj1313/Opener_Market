import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShopDiscountService } from './shop-discount.service';
import { CreateShopDiscountDto } from './dto/create-shop-discount.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('shop-discounts')
export class ShopDiscountController {
  constructor(private readonly shopDiscountService: ShopDiscountService) {}

  // POST /shop-discounts
  // 상점 할인 등록 (SELLER)
  @Post()
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateShopDiscountDto,
    @GetUser('userId') userId: string,
  ) {
    return this.shopDiscountService.create(dto, userId);
  }

  // GET /shop-discounts/my
  // 내 상점 할인 목록 (SELLER)
  @Get('my')
  @Roles(Role.SELLER)
  async findMyShopDiscounts(@GetUser('userId') userId: string) {
    return this.shopDiscountService.findMyShopDiscounts(userId);
  }

  // DELETE /shop-discounts/:id
  // 상점 할인 삭제 (SELLER)
  @Delete(':id')
  @Roles(Role.SELLER)
  async remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.shopDiscountService.remove(id, userId);
  }
}
