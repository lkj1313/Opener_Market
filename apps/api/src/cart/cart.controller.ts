import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // POST /cart/items
  // 장바구니에 상품 추가 (BUYER)
  @Post('items')
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.CREATED)
  async addToCart(
    @Body() dto: AddToCartDto,
    @GetUser('userId') userId: string,
  ) {
    return this.cartService.addToCart(dto, userId);
  }

  // GET /cart
  // 내 장바구니 조회 (BUYER)
  @Get()
  @Roles(Role.BUYER)
  async getMyCart(@GetUser('userId') userId: string) {
    return this.cartService.getMyCart(userId);
  }

  // PATCH /cart/items/:itemId
  // 수량 변경 (BUYER)
  @Patch('items/:itemId')
  @Roles(Role.BUYER)
  async updateQuantity(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @GetUser('userId') userId: string,
  ) {
    return this.cartService.updateQuantity(itemId, dto, userId);
  }

  // DELETE /cart/items/:itemId
  // 특정 상품 삭제 (BUYER)
  @Delete('items/:itemId')
  @Roles(Role.BUYER)
  async removeItem(
    @Param('itemId') itemId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.cartService.removeItem(itemId, userId);
  }

  // DELETE /cart/items
  // 장바구니 비우기 (BUYER)
  @Delete('items')
  @Roles(Role.BUYER)
  async clearCart(@GetUser('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
