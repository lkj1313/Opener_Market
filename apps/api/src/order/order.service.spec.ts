import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { ORDER_ERROR_CODES } from './error-codes/order.error-code';
import { OrderStatus } from '../generated/prisma/enums';

type MockPrismaService = {
  cart: { findUnique: jest.Mock };
  cartItem: { deleteMany: jest.Mock };
  product: {
    findUnique: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  order: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  subOrder: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  orderItem: { create: jest.Mock };
  seller: { findUnique: jest.Mock };
  $transaction: jest.Mock;
};

type TransactionOperation =
  | Promise<unknown>[]
  | ((tx: MockPrismaService) => Promise<unknown>);

describe('OrderService', () => {
  let service: OrderService;
  let prisma: MockPrismaService;

  const mockPrismaService: MockPrismaService = {
    cart: {
      findUnique: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    subOrder: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
    seller: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(
      async (operations: TransactionOperation) => {
        if (typeof operations === 'function') {
          return operations(mockPrismaService);
        }
        return Promise.all(operations);
      },
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<MockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-123';
    const dto = { address: '서울시 강남구' };

    it('장바구니가 비어있으면 CART_EMPTY 에러', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(
        new BaseException(ORDER_ERROR_CODES.CART_EMPTY),
      );
    });

    it('재고가 부족하면 STOCK_INSUFFICIENT 에러', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId,
        items: [
          {
            id: 'ci-1',
            quantity: 10,
            product: {
              id: 'prod-1',
              name: '초코파이',
              price: 10000,
              stock: 5, // 요청 수량보다 적음
              sellerId: 'seller-1',
              seller: { id: 'seller-1', shopName: 'A가게' },
              discounts: [],
            },
          },
        ],
      });

      await expect(service.create(dto, userId)).rejects.toThrow(
        new BaseException(ORDER_ERROR_CODES.STOCK_INSUFFICIENT),
      );
    });

    it('정상 주문 시 Order + SubOrder + OrderItem 생성', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId,
        items: [
          {
            id: 'ci-1',
            quantity: 2,
            product: {
              id: 'prod-1',
              name: '초코파이',
              price: 10000,
              stock: 100,
              sellerId: 'seller-1',
              seller: { id: 'seller-1', shopName: 'A가게' },
              discounts: [],
            },
          },
          {
            id: 'ci-2',
            quantity: 1,
            product: {
              id: 'prod-2',
              name: '감자칩',
              price: 5000,
              stock: 50,
              sellerId: 'seller-2',
              seller: { id: 'seller-2', shopName: 'B가게' },
              discounts: [],
            },
          },
        ],
      });

      prisma.order.create.mockResolvedValue({ id: 'order-1', userId });
      prisma.subOrder.create.mockResolvedValue({ id: 'sub-1' });
      prisma.orderItem.create.mockResolvedValue({ id: 'oi-1' });
      prisma.product.update.mockResolvedValue({});
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId,
        items: [],
      });

      const result = await service.create(dto, userId);

      expect(result?.id).toBe('order-1');
      expect(prisma.order.create).toHaveBeenCalled();
      expect(prisma.subOrder.create).toHaveBeenCalledTimes(2); // 판매자별 2개
      expect(prisma.orderItem.create).toHaveBeenCalledTimes(2);
      expect(prisma.product.update).toHaveBeenCalledTimes(2); // 재고 차감
      expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
    });
  });

  describe('findMyOrders', () => {
    it('내 주문 목록 반환', async () => {
      const orders = [
        { id: 'order-1', userId: 'user-123', items: [] },
        { id: 'order-2', userId: 'user-123', items: [] },
      ];
      prisma.order.findMany.mockResolvedValue(orders);

      const result = await service.findMyOrders('user-123');

      expect(result).toHaveLength(2);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-123' },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    const userId = 'user-123';

    it('주문이 없으면 ORDER_NOT_FOUND 에러', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent', userId)).rejects.toThrow(
        new BaseException(ORDER_ERROR_CODES.ORDER_NOT_FOUND),
      );
    });

    it('다른 유저의 주문이면 ORDER_FORBIDDEN 에러', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'other-user',
        items: [],
      });

      await expect(service.findOne('order-1', userId)).rejects.toThrow(
        new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN),
      );
    });

    it('정상 조회', async () => {
      const order = {
        id: 'order-1',
        userId,
        items: [{ id: 'sub-1', items: [] }],
      };
      prisma.order.findUnique.mockResolvedValue(order);

      const result = await service.findOne('order-1', userId);

      expect(result?.id).toBe('order-1');
    });
  });

  describe('cancel', () => {
    const userId = 'user-123';

    it('이미 CANCELLED면 CANNOT_CANCEL 에러', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId,
        items: [
          {
            id: 'sub-1',
            status: OrderStatus.CANCELLED,
            items: [],
          },
        ],
      });

      await expect(service.cancel('order-1', userId)).rejects.toThrow(
        new BaseException(ORDER_ERROR_CODES.CANNOT_CANCEL),
      );
    });

    it('이미 DELIVERED면 CANNOT_CANCEL 에러', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId,
        items: [
          {
            id: 'sub-1',
            status: OrderStatus.DELIVERED,
            items: [],
          },
        ],
      });

      await expect(service.cancel('order-1', userId)).rejects.toThrow(
        new BaseException(ORDER_ERROR_CODES.CANNOT_CANCEL),
      );
    });

    it('정상 취소 시 상태 변경 + 재고 복구', async () => {
      prisma.order.findUnique
        .mockResolvedValueOnce({
          id: 'order-1',
          userId,
          items: [
            {
              id: 'sub-1',
              status: OrderStatus.PAID,
              items: [{ productId: 'prod-1', quantity: 2 }],
            },
          ],
        })
        .mockResolvedValueOnce({ id: 'order-1', userId, items: [] });
      prisma.subOrder.update.mockResolvedValue({
        id: 'sub-1',
        status: OrderStatus.CANCELLED,
      });
      prisma.product.update.mockResolvedValue({ id: 'prod-1' });

      const result = await service.cancel('order-1', userId);

      expect(result?.id).toBe('order-1');
      expect(prisma.subOrder.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: OrderStatus.CANCELLED },
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          stock: { increment: 2 },
          salesCount: { decrement: 2 },
        },
      });
    });
  });

  describe('findSellerSubOrders', () => {
    it('Seller가 없으면 ORDER_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue(null);

      await expect(service.findSellerSubOrders('user-123')).rejects.toThrow(
        new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN),
      );
    });

    it('판매자의 SubOrder 목록 반환', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId: 'user-123',
      });
      prisma.subOrder.findMany.mockResolvedValue([
        { id: 'sub-1', sellerId: 'seller-1', items: [] },
      ]);

      const result = await service.findSellerSubOrders('user-123');

      expect(result).toHaveLength(1);
      expect(prisma.subOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sellerId: 'seller-1' },
        }),
      );
    });
  });

  describe('updateSubOrderStatus', () => {
    it('Seller가 없으면 ORDER_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSubOrderStatus(
          'sub-1',
          { status: OrderStatus.SHIPPED },
          'user-123',
        ),
      ).rejects.toThrow(new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN));
    });

    it('다른 판매자의 SubOrder면 ORDER_FORBIDDEN 에러', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId: 'user-123',
      });
      prisma.subOrder.findUnique.mockResolvedValue({
        id: 'sub-1',
        sellerId: 'seller-2',
      });

      await expect(
        service.updateSubOrderStatus(
          'sub-1',
          { status: OrderStatus.SHIPPED },
          'user-123',
        ),
      ).rejects.toThrow(new BaseException(ORDER_ERROR_CODES.ORDER_FORBIDDEN));
    });

    it('SHIPPED 상태 변경 시 shippedAt 설정', async () => {
      prisma.seller.findUnique.mockResolvedValue({
        id: 'seller-1',
        userId: 'user-123',
      });
      prisma.subOrder.findUnique.mockResolvedValue({
        id: 'sub-1',
        sellerId: 'seller-1',
      });
      prisma.subOrder.update.mockResolvedValue({
        id: 'sub-1',
        status: OrderStatus.SHIPPED,
        trackingNumber: '123456789',
      });

      const result = await service.updateSubOrderStatus(
        'sub-1',
        {
          status: OrderStatus.SHIPPED,
          trackingNumber: '123456789',
          shippingCompany: 'CJ대한통운',
        },
        'user-123',
      );

      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.trackingNumber).toBe('123456789');
      expect(prisma.subOrder.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: expect.objectContaining({
          status: OrderStatus.SHIPPED,
          trackingNumber: '123456789',
          shippingCompany: 'CJ대한통운',
          shippedAt: expect.any(Date),
        }),
      });
    });
  });
});
