import { Injectable } from '@nestjs/common';
import {
  calculateSkip,
  createPaginatedResult,
  normalizePagination,
} from '@opener/shared';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { PRODUCT_ERROR_CODES } from './error-codes/product.error-code';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { ProductStatus } from '../generated/prisma/enums';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 상품 등록 (SELLER)
  async create(dto: CreateProductDto, userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN);
    }

    return this.prisma.product.create({
      data: {
        sellerId: seller.id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        status: dto.status ?? ProductStatus.ACTIVE,
      },
    });
  }

  // 2. 전체 상품 목록 (BUYER용, ACTIVE만)
  async findAll(query: { page?: number; limit?: number }) {
    const { page, limit } = normalizePagination(query.page, query.limit);
    const skip = calculateSkip(page, limit);

    const where = { status: ProductStatus.ACTIVE };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          seller: { select: { id: true, shopName: true } },
          discounts: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // 판매자별 상점 할인 한 번에 조회
    const sellerIds = [...new Set(products.map((p) => p.sellerId))];
    const shopDiscounts = await this.prisma.shopDiscount.findMany({
      where: {
        sellerId: { in: sellerIds },
        isActive: true,
      },
    });
    const shopDiscountMap = new Map<string, typeof shopDiscounts>();
    for (const sd of shopDiscounts) {
      if (!shopDiscountMap.has(sd.sellerId)) {
        shopDiscountMap.set(sd.sellerId, []);
      }
      shopDiscountMap.get(sd.sellerId)!.push(sd);
    }

    const data = products.map((p) => ({
      ...p,
      discountedPrice: this.calculateDiscountedPrice(
        p.price,
        p.discounts,
        shopDiscountMap.get(p.sellerId) ?? [],
      ),
    }));

    return createPaginatedResult(data, total, page, limit);
  }

  // 3. 내 상품 목록 (SELLER용)
  async findMyProducts(
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN);
    }

    const { page, limit } = normalizePagination(query.page, query.limit);
    const skip = calculateSkip(page, limit);

    const where = { sellerId: seller.id };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { discounts: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return createPaginatedResult(products, total, page, limit);
  }

  // 4. 상품 상세
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, shopName: true } },
        discounts: true,
      },
    });

    if (!product) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    const shopDiscounts = await this.prisma.shopDiscount.findMany({
      where: {
        sellerId: product.sellerId,
        isActive: true,
      },
    });

    return {
      ...product,
      discountedPrice: this.calculateDiscountedPrice(
        product.price,
        product.discounts,
        shopDiscounts,
      ),
    };
  }

  // 5. 상품 수정 (SELLER)
  async update(id: string, dto: UpdateProductDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!product) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    if (product.seller.userId !== userId) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN);
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  // 6. 상품 삭제 (소프트 딜리트 → HIDDEN, SELLER)
  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!product) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    if (product.seller.userId !== userId) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN);
    }

    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.HIDDEN },
    });
  }

  // 7. 상품 상태 변경 (ADMIN용)
  async updateStatusByAdmin(id: string, dto: UpdateProductStatusDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    return this.prisma.product.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  // 할인 적용 가격 계산
  // 1. 상점 할인(ShopDiscount)을 원가에 먼저 적용 → 중간 가격
  // 2. 개별 할인(Discount)을 중간 가격에 적용 → 최종 가격
  private calculateDiscountedPrice(
    price: number,
    productDiscounts: {
      type: string;
      value: number;
      startAt: Date | null;
      endAt: Date | null;
      isActive: boolean;
    }[],
    shopDiscounts: {
      type: string;
      value: number;
      startAt: Date | null;
      endAt: Date | null;
      isActive: boolean;
    }[] = [],
  ): number {
    const now = new Date();

    const isActive = (d: {
      startAt: Date | null;
      endAt: Date | null;
      isActive: boolean;
    }) => {
      if (!d.isActive) return false;
      if (d.startAt && d.startAt > now) return false;
      if (d.endAt && d.endAt < now) return false;
      return true;
    };

    const applyDiscount = (
      basePrice: number,
      discount: { type: string; value: number },
    ): number => {
      if (discount.type === 'PERCENT') {
        return Math.floor((basePrice * (100 - discount.value)) / 100);
      }
      return basePrice - discount.value;
    };

    // Step 1: 상점 할인 중 가장 저렴한 가격 적용 (원가 기준)
    const activeShopDiscounts = shopDiscounts.filter(isActive);
    let shopDiscountedPrice = price;
    for (const discount of activeShopDiscounts) {
      const discounted = applyDiscount(price, discount);
      const clamped = Math.max(0, discounted);
      if (clamped < shopDiscountedPrice) {
        shopDiscountedPrice = clamped;
      }
    }

    // Step 2: 개별 할인 중 가장 저렴한 가격 적용 (상점 할인 적용된 가격 기준)
    const activeProductDiscounts = productDiscounts.filter(isActive);
    let finalPrice = shopDiscountedPrice;
    for (const discount of activeProductDiscounts) {
      const discounted = applyDiscount(shopDiscountedPrice, discount);
      const clamped = Math.max(0, discounted);
      if (clamped < finalPrice) {
        finalPrice = clamped;
      }
    }

    return finalPrice;
  }
}
