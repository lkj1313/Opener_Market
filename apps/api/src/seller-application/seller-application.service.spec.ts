import { Test, TestingModule } from '@nestjs/testing';
import { SellerApplicationService } from './seller-application.service';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { SELLER_APPLICATION_ERROR_CODES } from './error-codes/seller-application.error-code';
import { Role, SellerApplicationStatus } from '../generated/prisma/enums';

describe('SellerApplicationService', () => {
  let service: SellerApplicationService;
  let prisma: typeof mockPrismaService;

  // PrismaService Mock: 실제 DB 대신 호출 기록과 반환값을 조작
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sellerApplication: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    // Prisma 트랜잭션을 흉낸다. 배열로 들어온 연산들을 순서대로 실행하고 결과를 배열로 반환
    $transaction: jest.fn(async (operations: any[]) => Promise.all(operations)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerApplicationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SellerApplicationService>(SellerApplicationService);
    prisma = module.get<typeof mockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      shopName: '맛있는 과자',
      businessAddress: '서울특별시 강남구 테헤란로 123',
      returnAddress: '서울특별시 서초구 반포대로 456',
    };
    const userId = 'user-123';

    it('이미 SELLER인 경우 ALREADY_SELLER 에러', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: Role.SELLER,
      });

      await expect(service.create(dto, userId)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.ALREADY_SELLER),
      );
    });

    it('PENDING 신청이 이미 있으면 APPLICATION_EXISTS 에러', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: Role.BUYER,
      });
      prisma.sellerApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        status: SellerApplicationStatus.PENDING,
      });

      await expect(service.create(dto, userId)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.APPLICATION_EXISTS),
      );
    });

    it('상점명 중복이면 SHOP_NAME_EXISTS 에러', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: Role.BUYER,
      });
      prisma.sellerApplication.findUnique.mockResolvedValue(null);
      prisma.sellerApplication.findFirst.mockResolvedValue({ id: 'app-other' });

      await expect(service.create(dto, userId)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.SHOP_NAME_EXISTS),
      );
    });

    it('정상 신청 시 생성된 신청 반환', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: Role.BUYER,
      });
      prisma.sellerApplication.findUnique.mockResolvedValue(null);
      prisma.sellerApplication.findFirst.mockResolvedValue(null);
      prisma.sellerApplication.create.mockResolvedValue({
        id: 'app-1',
        userId,
        shopName: dto.shopName,
        businessAddress: dto.businessAddress,
        returnAddress: dto.returnAddress,
        status: SellerApplicationStatus.PENDING,
      });

      const result = await service.create(dto, userId);

      expect(result).toEqual({
        id: 'app-1',
        userId,
        shopName: dto.shopName,
        businessAddress: dto.businessAddress,
        returnAddress: dto.returnAddress,
        status: SellerApplicationStatus.PENDING,
      });
      expect(prisma.sellerApplication.create).toHaveBeenCalledWith({
        data: {
          userId,
          shopName: dto.shopName,
          businessAddress: dto.businessAddress,
          returnAddress: dto.returnAddress,
        },
      });
    });
  });

  describe('findMyApplication', () => {
    const userId = 'user-123';

    it('신청 내역이 없으면 APPLICATION_NOT_FOUND 에러', async () => {
      prisma.sellerApplication.findUnique.mockResolvedValue(null);

      await expect(service.findMyApplication(userId)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.APPLICATION_NOT_FOUND),
      );
    });

    it('신청 내역이 있으면 반환', async () => {
      const application = {
        id: 'app-1',
        userId,
        shopName: '맛있는 과자',
        status: SellerApplicationStatus.PENDING,
      };
      prisma.sellerApplication.findUnique.mockResolvedValue(application);

      const result = await service.findMyApplication(userId);

      expect(result).toEqual(application);
    });
  });

  describe('findAll', () => {
    it('전체 신청 목록을 최신순으로 반환', async () => {
      const applications = [
        { id: 'app-2', shopName: '신규 샵', createdAt: new Date('2026-05-26') },
        { id: 'app-1', shopName: '기존 샵', createdAt: new Date('2026-05-25') },
      ];
      prisma.sellerApplication.findMany.mockResolvedValue(applications);

      const result = await service.findAll();

      expect(result).toEqual(applications);
      expect(prisma.sellerApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
          include: { user: { select: expect.any(Object) } },
        }),
      );
    });
  });

  describe('approve', () => {
    const appId = 'app-1';

    it('신청이 없으면 APPLICATION_NOT_FOUND 에러', async () => {
      prisma.sellerApplication.findUnique.mockResolvedValue(null);

      await expect(service.approve(appId)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.APPLICATION_NOT_FOUND),
      );
    });

    it('이미 처리된 신청이면 ALREADY_REVIEWED 에러', async () => {
      prisma.sellerApplication.findUnique.mockResolvedValue({
        id: appId,
        status: SellerApplicationStatus.APPROVED,
      });

      await expect(service.approve(appId)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.ALREADY_REVIEWED),
      );
    });

    it('정상 승인 시 트랜잭션으로 신청 상태와 유저 역할을 함께 변경', async () => {
      prisma.sellerApplication.findUnique.mockResolvedValue({
        id: appId,
        userId: 'user-123',
        status: SellerApplicationStatus.PENDING,
      });
      prisma.sellerApplication.update.mockResolvedValue({
        id: appId,
        status: SellerApplicationStatus.APPROVED,
      });
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        role: Role.SELLER,
      });

      const result = await service.approve(appId);

      expect(result).toEqual({
        id: appId,
        status: SellerApplicationStatus.APPROVED,
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.sellerApplication.update).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    const appId = 'app-1';
    const dto = { rejectReason: '서류 미비' };

    it('신청이 없으면 APPLICATION_NOT_FOUND 에러', async () => {
      prisma.sellerApplication.findUnique.mockResolvedValue(null);

      await expect(service.reject(appId, dto)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.APPLICATION_NOT_FOUND),
      );
    });

    it('이미 처리된 신청이면 ALREADY_REVIEWED 에러', async () => {
      prisma.sellerApplication.findUnique.mockResolvedValue({
        id: appId,
        status: SellerApplicationStatus.REJECTED,
      });

      await expect(service.reject(appId, dto)).rejects.toThrow(
        new BaseException(SELLER_APPLICATION_ERROR_CODES.ALREADY_REVIEWED),
      );
    });

    it('정상 거부 시 상태와 사유를 기록', async () => {
      prisma.sellerApplication.findUnique.mockResolvedValue({
        id: appId,
        status: SellerApplicationStatus.PENDING,
      });
      prisma.sellerApplication.update.mockResolvedValue({
        id: appId,
        status: SellerApplicationStatus.REJECTED,
        rejectReason: dto.rejectReason,
      });

      const result = await service.reject(appId, dto);

      expect(result).toEqual({
        id: appId,
        status: SellerApplicationStatus.REJECTED,
        rejectReason: dto.rejectReason,
      });
      expect(prisma.sellerApplication.update).toHaveBeenCalledWith({
        where: { id: appId },
        data: {
          status: SellerApplicationStatus.REJECTED,
          rejectReason: dto.rejectReason,
          reviewedAt: expect.any(Date),
        },
      });
    });
  });
});
