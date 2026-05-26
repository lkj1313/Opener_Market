import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { CART_ERROR_CODES } from './error-codes/cart.error-code';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductStatus } from '../generated/prisma/enums';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 장바구니에 상품 추가
  async addToCart(dto: AddToCartDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new BaseException(CART_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    // Cart가 없으면 생성
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // 이미 담긴 상품이면 수량 증가
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    }

    // 새로 추가
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }

  // 2. 내 장바구니 조회
  async getMyCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              include: {
                seller: { select: { id: true, shopName: true } },
                discounts: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            orderBy: { createdAt: 'desc' },
            include: {
              product: {
                include: {
                  seller: { select: { id: true, shopName: true } },
                  discounts: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  // 3. 수량 변경
  async updateQuantity(
    itemId: string,
    dto: UpdateCartItemDto,
    userId: string,
  ) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new BaseException(CART_ERROR_CODES.CART_ITEM_NOT_FOUND);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
  }

  // 4. 특정 상품 삭제
  async removeItem(itemId: string, userId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new BaseException(CART_ERROR_CODES.CART_ITEM_NOT_FOUND);
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  // 5. 장바구니 비우기
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) return;

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}
