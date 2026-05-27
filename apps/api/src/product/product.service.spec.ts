import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { BaseException } from '../common/exceptions/base.exception';
import { PRODUCT_ERROR_CODES } from './error-codes/product.error-code';
import { ProductStatus, Role, DiscountType } from '../generated/prisma/enums';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: typeof mockPrismaService;
  let redis: typeof mockRedisService;

  const mockPrismaService = {
    seller: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    shopDiscount: {
      findMany: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    setex: jest.fn(),
    delByPattern: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<typeof mockPrismaService>(PrismaService);
    redis = module.get<typeof mockRedisService>(RedisService);

    jest.clearAllMocks();
    redis.get.mockResolvedValue(null);
  });

  describe('create', () => {
    const dto = {
      name: '테스트 상품',
      description: '설명',
      price: 10000,
      stock: 50,
    };
    const userId = 'user-123';

    it('Seller가 없으면 PRODUCT_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(
        new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN),
      );
    });

    it('정상 등록 시 상품 반환', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.product.create.mockResolvedValue({
        id: 'product-1',
        sellerId: 'seller-1',
        ...dto,
        status: ProductStatus.ACTIVE,
      });

      const result = await service.create(dto, userId);

      expect(result).toEqual({
        id: 'product-1',
        sellerId: 'seller-1',
        ...dto,
        status: ProductStatus.ACTIVE,
      });
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          sellerId: 'seller-1',
          categoryId: null,
          name: dto.name,
          description: dto.description,
          price: dto.price,
          stock: dto.stock,
          status: ProductStatus.ACTIVE,
        },
      });
    });
  });

  describe('findAll', () => {
    it('ACTIVE 상품 목록을 페이지네이션과 함께 반환', async () => {
      const products = [
        {
          id: 'p-1',
          name: '상품1',
          price: 10000,
          status: ProductStatus.ACTIVE,
          seller: { id: 's-1', shopName: '샵A' },
          discounts: [
            {
              type: DiscountType.PERCENT,
              value: 10,
              startAt: null,
              endAt: null,
              isActive: true,
            },
          ],
        },
      ];
      prisma.product.findMany.mockResolvedValue(products);
      prisma.product.count.mockResolvedValue(1);
      prisma.shopDiscount.findMany.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].discountedPrice).toBe(9000);
      expect(result.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('findMyProducts', () => {
    const userId = 'user-123';

    it('Seller가 없으면 PRODUCT_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue(null);

      await expect(service.findMyProducts(userId, {})).rejects.toThrow(
        new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN),
      );
    });

    it('내 상품 목록 반환', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.product.findMany.mockResolvedValue([
        { id: 'p-1', name: '내 상품', sellerId: 'seller-1' },
      ]);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.findMyProducts(userId, {});

      expect(result.data).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sellerId: 'seller-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('상품이 없으면 PRODUCT_NOT_FOUND 에러', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });

    it('상품 반환 (할인가 포함)', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        name: '상품',
        price: 20000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵A' },
        discounts: [
          {
            type: DiscountType.FIXED,
            value: 5000,
            startAt: null,
            endAt: null,
            isActive: true,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([]);

      const result = await service.findOne('p-1');

      expect(result.price).toBe(20000);
      expect(result.discountedPrice).toBe(15000);
    });
  });

  describe('update', () => {
    const userId = 'user-123';

    it('상품이 없으면 PRODUCT_NOT_FOUND 에러', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('p-1', { name: '변경' }, userId),
      ).rejects.toThrow(new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND));
    });

    it('소유자가 아니면 PRODUCT_FORBIDDEN 에러', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        seller: { userId: 'other-user' },
      });

      await expect(
        service.update('p-1', { name: '변경' }, userId),
      ).rejects.toThrow(new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN));
    });

    it('정상 수정 시 반환', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        seller: { userId },
      });
      prisma.product.update.mockResolvedValue({
        id: 'p-1',
        name: '변경된 이름',
      });

      const result = await service.update('p-1', { name: '변경된 이름' }, userId);

      expect(result.name).toBe('변경된 이름');
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: { name: '변경된 이름' },
      });
    });
  });

  describe('remove', () => {
    const userId = 'user-123';

    it('상품이 없으면 PRODUCT_NOT_FOUND 에러', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('p-1', userId)).rejects.toThrow(
        new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });

    it('소유자가 아니면 PRODUCT_FORBIDDEN 에러', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        seller: { userId: 'other-user' },
      });

      await expect(service.remove('p-1', userId)).rejects.toThrow(
        new BaseException(PRODUCT_ERROR_CODES.PRODUCT_FORBIDDEN),
      );
    });

    it('정상 삭제 시 status를 HIDDEN으로 변경', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        seller: { userId },
      });
      prisma.product.update.mockResolvedValue({
        id: 'p-1',
        status: ProductStatus.HIDDEN,
      });

      const result = await service.remove('p-1', userId);

      expect(result.status).toBe(ProductStatus.HIDDEN);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: { status: ProductStatus.HIDDEN },
      });
    });
  });

  describe('updateStatusByAdmin', () => {
    it('상품이 없으면 PRODUCT_NOT_FOUND 에러', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatusByAdmin('p-1', { status: ProductStatus.BLIND }),
      ).rejects.toThrow(new BaseException(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND));
    });

    it('정상 상태 변경', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        status: ProductStatus.ACTIVE,
      });
      prisma.product.update.mockResolvedValue({
        id: 'p-1',
        status: ProductStatus.BLIND,
      });

      const result = await service.updateStatusByAdmin('p-1', {
        status: ProductStatus.BLIND,
      });

      expect(result.status).toBe(ProductStatus.BLIND);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: { status: ProductStatus.BLIND },
      });
    });
  });

  describe('calculateDiscountedPrice (indirect via findAll/findOne)', () => {
    it('PERCENT 할인 적용', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 10000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [
          {
            type: DiscountType.PERCENT,
            value: 20,
            startAt: null,
            endAt: null,
            isActive: true,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([]);

      const result = await service.findOne('p-1');
      expect(result.discountedPrice).toBe(8000);
    });

    it('FIXED 할인 적용', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 10000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [
          {
            type: DiscountType.FIXED,
            value: 3000,
            startAt: null,
            endAt: null,
            isActive: true,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([]);

      const result = await service.findOne('p-1');
      expect(result.discountedPrice).toBe(7000);
    });

    it('기간이 지난 할인은 무시', async () => {
      const past = new Date('2020-01-01');
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 10000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [
          {
            type: DiscountType.PERCENT,
            value: 50,
            startAt: null,
            endAt: past,
            isActive: true,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([]);

      const result = await service.findOne('p-1');
      expect(result.discountedPrice).toBe(10000);
    });

    it('isActive가 false면 무시', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 10000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [
          {
            type: DiscountType.PERCENT,
            value: 50,
            startAt: null,
            endAt: null,
            isActive: false,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([]);

      const result = await service.findOne('p-1');
      expect(result.discountedPrice).toBe(10000);
    });

    it('여러 개별 할인 중 최저가 적용', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 10000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [
          {
            type: DiscountType.PERCENT,
            value: 10,
            startAt: null,
            endAt: null,
            isActive: true,
          },
          {
            type: DiscountType.FIXED,
            value: 3000,
            startAt: null,
            endAt: null,
            isActive: true,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([]);

      const result = await service.findOne('p-1');
      // 10% -> 9000, 3000원 -> 7000, 최저가 7000
      expect(result.discountedPrice).toBe(7000);
    });

    it('상점 할인 + 개별 할인 중복 적용 (상점 먼저)', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 10000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [
          {
            type: DiscountType.FIXED,
            value: 1000,
            startAt: null,
            endAt: null,
            isActive: true,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([
        {
          type: DiscountType.PERCENT,
          value: 10,
          startAt: null,
          endAt: null,
          isActive: true,
        },
      ]);

      const result = await service.findOne('p-1');
      // 상점 10%: 10000 -> 9000
      // 개별 1000원: 9000 -> 8000
      expect(result.discountedPrice).toBe(8000);
    });

    it('상점 할인만 있을 때', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 20000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([
        {
          type: DiscountType.FIXED,
          value: 5000,
          startAt: null,
          endAt: null,
          isActive: true,
        },
      ]);

      const result = await service.findOne('p-1');
      expect(result.discountedPrice).toBe(15000);
    });

    it('상점 할인 여러 개 중 최저가만 적용 후 개별 할인 적용', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p-1',
        price: 10000,
        sellerId: 's-1',
        seller: { id: 's-1', shopName: '샵' },
        discounts: [
          {
            type: DiscountType.PERCENT,
            value: 10,
            startAt: null,
            endAt: null,
            isActive: true,
          },
        ],
      });
      prisma.shopDiscount.findMany.mockResolvedValue([
        {
          type: DiscountType.PERCENT,
          value: 5,
          startAt: null,
          endAt: null,
          isActive: true,
        },
        {
          type: DiscountType.FIXED,
          value: 3000,
          startAt: null,
          endAt: null,
          isActive: true,
        },
      ]);

      const result = await service.findOne('p-1');
      // 상점: 5% -> 9500 vs 3000원 -> 7000 → 상점 최저 7000
      // 개별 10%: 7000 -> 6300
      expect(result.discountedPrice).toBe(6300);
    });
  });
});
