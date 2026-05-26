import { Test, TestingModule } from '@nestjs/testing';
import { ShopDiscountService } from './shop-discount.service';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { SHOP_DISCOUNT_ERROR_CODES } from './error-codes/shop-discount.error-code';
import { DiscountType } from '../generated/prisma/enums';

describe('ShopDiscountService', () => {
  let service: ShopDiscountService;
  let prisma: typeof mockPrismaService;

  const mockPrismaService = {
    seller: {
      findUnique: jest.fn(),
    },
    shopDiscount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopDiscountService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ShopDiscountService>(ShopDiscountService);
    prisma = module.get<typeof mockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      type: DiscountType.PERCENT,
      value: 10,
      startAt: '2026-06-01T00:00:00Z',
      endAt: '2026-06-30T23:59:59Z',
    };
    const userId = 'user-123';

    it('Seller가 없으면 SHOP_DISCOUNT_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(
        new BaseException(SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN),
      );
    });

    it('정상 등록 시 할인 반환', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.shopDiscount.create.mockResolvedValue({
        id: 'discount-1',
        sellerId: 'seller-1',
        type: dto.type,
        value: dto.value,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        isActive: true,
      });

      const result = await service.create(dto, userId);

      expect(result).toEqual({
        id: 'discount-1',
        sellerId: 'seller-1',
        type: dto.type,
        value: dto.value,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        isActive: true,
      });
      expect(prisma.shopDiscount.create).toHaveBeenCalledWith({
        data: {
          sellerId: 'seller-1',
          type: dto.type,
          value: dto.value,
          startAt: new Date(dto.startAt),
          endAt: new Date(dto.endAt),
          isActive: true,
        },
      });
    });

    it('startAt/endAt 없이 등록 시 undefined로 저장', async () => {
      const dtoWithoutDates = { type: DiscountType.FIXED, value: 5000 };
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.shopDiscount.create.mockResolvedValue({
        id: 'discount-2',
        sellerId: 'seller-1',
        type: dtoWithoutDates.type,
        value: dtoWithoutDates.value,
        startAt: undefined,
        endAt: undefined,
        isActive: true,
      });

      const result = await service.create(dtoWithoutDates, userId);

      expect(result.startAt).toBeUndefined();
      expect(result.endAt).toBeUndefined();
      expect(prisma.shopDiscount.create).toHaveBeenCalledWith({
        data: {
          sellerId: 'seller-1',
          type: dtoWithoutDates.type,
          value: dtoWithoutDates.value,
          startAt: undefined,
          endAt: undefined,
          isActive: true,
        },
      });
    });
  });

  describe('findMyShopDiscounts', () => {
    const userId = 'user-123';

    it('Seller가 없으면 SHOP_DISCOUNT_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue(null);

      await expect(service.findMyShopDiscounts(userId)).rejects.toThrow(
        new BaseException(SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN),
      );
    });

    it('내 상점 할인 목록 반환', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.shopDiscount.findMany.mockResolvedValue([
        { id: 'd-1', type: DiscountType.PERCENT, value: 10 },
        { id: 'd-2', type: DiscountType.FIXED, value: 3000 },
      ]);

      const result = await service.findMyShopDiscounts(userId);

      expect(result).toHaveLength(2);
      expect(prisma.shopDiscount.findMany).toHaveBeenCalledWith({
        where: { sellerId: 'seller-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('remove', () => {
    const userId = 'user-123';

    it('Seller가 없으면 SHOP_DISCOUNT_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue(null);

      await expect(service.remove('d-1', userId)).rejects.toThrow(
        new BaseException(SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN),
      );
    });

    it('할인이 없으면 SHOP_DISCOUNT_NOT_FOUND 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.shopDiscount.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', userId)).rejects.toThrow(
        new BaseException(SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_NOT_FOUND),
      );
    });

    it('다른 판매자의 할인이면 SHOP_DISCOUNT_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.shopDiscount.findUnique.mockResolvedValue({
        id: 'd-1',
        sellerId: 'seller-2',
      });

      await expect(service.remove('d-1', userId)).rejects.toThrow(
        new BaseException(SHOP_DISCOUNT_ERROR_CODES.SHOP_DISCOUNT_FORBIDDEN),
      );
    });

    it('정상 삭제 시 반환', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId,
      });
      prisma.shopDiscount.findUnique.mockResolvedValue({
        id: 'd-1',
        sellerId: 'seller-1',
      });
      prisma.shopDiscount.delete.mockResolvedValue({
        id: 'd-1',
        sellerId: 'seller-1',
      });

      const result = await service.remove('d-1', userId);

      expect(result.id).toBe('d-1');
      expect(prisma.shopDiscount.delete).toHaveBeenCalledWith({
        where: { id: 'd-1' },
      });
    });
  });
});
