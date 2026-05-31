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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  @Roles(Role.BUYER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: '장바구니에 상품 추가 (BUYER)' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: '추가 성공', type: CartItemResponseDto })
  async addToCart(
    @Body() dto: AddToCartDto,
    @GetUser('userId') userId: string,
  ) {
    return this.cartService.addToCart(dto, userId);
  }

  @Get()
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 장바구니 조회 (BUYER)' })
  @ApiResponse({ status: 200, description: '장바구니 반환', type: CartResponseDto })
  async getMyCart(@GetUser('userId') userId: string) {
    return this.cartService.getMyCart(userId);
  }

  @Patch('items/:itemId')
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '장바구니 수량 변경 (BUYER)' })
  @ApiParam({ name: 'itemId', description: '장바구니 아이템 ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: '변경된 아이템', type: CartItemResponseDto })
  async updateQuantity(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @GetUser('userId') userId: string,
  ) {
    return this.cartService.updateQuantity(itemId, dto, userId);
  }

  @Delete('items/:itemId')
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '장바구니 특정 상품 삭제 (BUYER)' })
  @ApiParam({ name: 'itemId', description: '장바구니 아이템 ID' })
  @ApiResponse({ status: 200, description: '삭제된 아이템', type: CartItemResponseDto })
  async removeItem(
    @Param('itemId') itemId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.cartService.removeItem(itemId, userId);
  }

  @Delete('items')
  @Roles(Role.BUYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '장바구니 비우기 (BUYER)' })
  async clearCart(@GetUser('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
