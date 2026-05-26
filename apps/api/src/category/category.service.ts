import { Injectable } from '@nestjs/common';
import {
  calculateSkip,
  createPaginatedResult,
  normalizePagination,
} from '@opener/shared';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { CATEGORY_ERROR_CODES } from './error-codes/category.error-code';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductStatus } from '../generated/prisma/enums';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 카테고리 등록
  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BaseException(CATEGORY_ERROR_CODES.SLUG_EXISTS);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId ?? null,
      },
    });
  }

  // 2. 전체 카테고리 트리 조회
  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return this.buildTree(categories);
  }

  // 3. 특정 카테고리 + 하위 카테고리 상품 목록
  async findProductsBySlug(
    slug: string,
    query: { page?: number; limit?: number },
  ) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new BaseException(CATEGORY_ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    // 해당 카테고리 + 모든 하위 카테고리 ID 수집
    const allCategoryIds = await this.getDescendantCategoryIds(category.id);

    const { page, limit } = normalizePagination(query.page, query.limit);
    const skip = calculateSkip(page, limit);

    const where = {
      status: ProductStatus.ACTIVE,
      categoryId: { in: allCategoryIds },
    };

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

    // 상점 할인 조회
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

  // 4. 카테고리 수정
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new BaseException(CATEGORY_ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new BaseException(CATEGORY_ERROR_CODES.SLUG_EXISTS);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  // 5. 카테고리 삭제
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new BaseException(CATEGORY_ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    // 하위 카테고리가 있으면 삭제 불가 (또는 연쇄 삭제)
    const children = await this.prisma.category.count({
      where: { parentId: id },
    });
    if (children > 0) {
      throw new BaseException({
        status: 400,
        code: 'CATEGORY-003',
        message: '하위 카테고리가 존재하여 삭제할 수 없습니다.',
      });
    }

    return this.prisma.category.delete({ where: { id } });
  }

  // 평면 목록 → 트리 구조 변환
  private buildTree(
    categories: {
      id: string;
      name: string;
      slug: string;
      parentId: string | null;
    }[],
  ) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const cat of categories) {
      map.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of categories) {
      const node = map.get(cat.id);
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  // 해당 카테고리 + 모든 하위 카테고리 ID 조회 (재귀)
  private async getDescendantCategoryIds(
    categoryId: string,
  ): Promise<string[]> {
    const result = new Set<string>([categoryId]);
    const queue = [categoryId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await this.prisma.category.findMany({
        where: { parentId: currentId },
        select: { id: true },
      });

      for (const child of children) {
        if (!result.has(child.id)) {
          result.add(child.id);
          queue.push(child.id);
        }
      }
    }

    return [...result];
  }

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

    const activeShopDiscounts = shopDiscounts.filter(isActive);
    let shopDiscountedPrice = price;
    for (const discount of activeShopDiscounts) {
      const discounted = applyDiscount(price, discount);
      const clamped = Math.max(0, discounted);
      if (clamped < shopDiscountedPrice) {
        shopDiscountedPrice = clamped;
      }
    }

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
