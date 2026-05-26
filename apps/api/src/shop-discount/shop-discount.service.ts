import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { SHOP_DISCOUNT_ERROR_CODES } from './error-codes/shop-discount.error-code';
import { CreateShopDiscountDto } from './dto/create-shop-discount.dto';

@Injectable()
export class ShopDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 상점 할인 등록 (SELLER)
  async create(dto: CreateShopDiscountDto, userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BaseException(
        SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN,
      );
    }

    return this.prisma.shopDiscount.create({
      data: {
        sellerId: seller.id,
        type: dto.type,
        value: dto.value,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }

  // 2. 내 상점 할인 목록 (SELLER)
  async findMyShopDiscounts(userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BaseException(
        SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN,
      );
    }

    return this.prisma.shopDiscount.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. 상점 할인 삭제 (SELLER)
  async remove(id: string, userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BaseException(
        SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN,
      );
    }

    const discount = await this.prisma.shopDiscount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new BaseException(
        SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_NOT_FOUND,
      );
    }

    if (discount.sellerId !== seller.id) {
      throw new BaseException(
        SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN,
      );
    }

    return this.prisma.shopDiscount.delete({
      where: { id },
    });
  }
}
