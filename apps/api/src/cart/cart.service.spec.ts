import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { CART_ERROR_CODES } from './error-codes/cart.error-code';
import { ProductStatus } from '../generated/prisma/enums';

describe('CartService', () => {
  let service: CartService;
  let prisma: typeof mockPrismaService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<typeof mockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    const dto = { productId: 'prod-1', quantity: 2 };
    const userId = 'user-123';

    it('상품이 없거나 ACTIVE가 아니면 PRODUCT_NOT_FOUND 에러', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.addToCart(dto, userId)).rejects.toThrow(
        new BaseException(CART_ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });

    it('상품이 HIDDEN이면 PRODUCT_NOT_FOUND 에러', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: dto.productId,
        status: ProductStatus.HIDDEN,
      });

      await expect(service.addToCart(dto, userId)).rejects.toThrow(
        new BaseException(CART_ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });

    it('Cart가 없으면 생성 후 아이템 추가', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: dto.productId,
        status: ProductStatus.ACTIVE,
      });
      prisma.cart.findUnique.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue({ id: 'cart-1', userId });
      prisma.cartItem.findUnique.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue({
        id: 'ci-1',
        cartId: 'cart-1',
        productId: dto.productId,
        quantity: dto.quantity,
      });

      const result = await service.addToCart(dto, userId);

      expect(result.quantity).toBe(2);
      expect(prisma.cart.create).toHaveBeenCalledWith({ data: { userId } });
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-1',
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    });

    it('Cart에 같은 상품이 있으면 수량 증가', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: dto.productId,
        status: ProductStatus.ACTIVE,
      });
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId });
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'ci-1',
        cartId: 'cart-1',
        productId: dto.productId,
        quantity: 3,
      });
      prisma.cartItem.update.mockResolvedValue({
        id: 'ci-1',
        quantity: 5,
      });

      const result = await service.addToCart(dto, userId);

      expect(result.quantity).toBe(5);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'ci-1' },
        data: { quantity: 5 },
      });
    });
  });

  describe('getMyCart', () => {
    const userId = 'user-123';

    it('Cart가 없으면 생성 후 반환', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue({
        id: 'cart-1',
        userId,
        items: [],
      });

      const result = await service.getMyCart(userId);

      expect(result.id).toBe('cart-1');
      expect(result.items).toEqual([]);
      expect(prisma.cart.create).toHaveBeenCalled();
    });

    it('Cart가 있으면 아이템 포함해서 반환', async () => {
      const cart = {
        id: 'cart-1',
        userId,
        items: [
          {
            id: 'ci-1',
            product: {
              id: 'prod-1',
              name: '초코파이',
              price: 5000,
              seller: { id: 'seller-1', shopName: '맛있는 과자' },
              discounts: [],
            },
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cart);

      const result = await service.getMyCart(userId);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].product.name).toBe('초코파이');
    });
  });

  describe('updateQuantity', () => {
    const userId = 'user-123';

    it('아이템이 없거나 소유자가 아니면 CART_ITEM_NOT_FOUND 에러', async () => {
      prisma.cartItem.findUnique.mockResolvedValue(null);

      await expect(
        service.updateQuantity('ci-1', { quantity: 5 }, userId),
      ).rejects.toThrow(new BaseException(CART_ERROR_CODES.CART_ITEM_NOT_FOUND));
    });

    it('다른 유저의 아이템이면 CART_ITEM_NOT_FOUND 에러', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'ci-1',
        cart: { userId: 'other-user' },
      });

      await expect(
        service.updateQuantity('ci-1', { quantity: 5 }, userId),
      ).rejects.toThrow(new BaseException(CART_ERROR_CODES.CART_ITEM_NOT_FOUND));
    });

    it('정상 수량 변경', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'ci-1',
        cart: { userId },
      });
      prisma.cartItem.update.mockResolvedValue({
        id: 'ci-1',
        quantity: 10,
      });

      const result = await service.updateQuantity('ci-1', { quantity: 10 }, userId);

      expect(result.quantity).toBe(10);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'ci-1' },
        data: { quantity: 10 },
      });
    });
  });

  describe('removeItem', () => {
    const userId = 'user-123';

    it('아이템이 없거나 소유자가 아니면 CART_ITEM_NOT_FOUND 에러', async () => {
      prisma.cartItem.findUnique.mockResolvedValue(null);

      await expect(service.removeItem('ci-1', userId)).rejects.toThrow(
        new BaseException(CART_ERROR_CODES.CART_ITEM_NOT_FOUND),
      );
    });

    it('정상 삭제', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'ci-1',
        cart: { userId },
      });
      prisma.cartItem.delete.mockResolvedValue({ id: 'ci-1' });

      const result = await service.removeItem('ci-1', userId);

      expect(result.id).toBe('ci-1');
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'ci-1' },
      });
    });
  });

  describe('clearCart', () => {
    const userId = 'user-123';

    it('Cart가 없으면 에러 없이 종료', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.clearCart(userId)).resolves.toBeUndefined();
      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('Cart가 있으면 모든 아이템 삭제', async () => {
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId });
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

      await service.clearCart(userId);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      });
    });
  });
});
