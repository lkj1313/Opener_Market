import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { USER_ERROR_CODES } from './error-codes/user.error-code';
import { Role, UserStatus } from '../generated/prisma/enums';

describe('UserService', () => {
  let service: UserService;
  let prisma: typeof mockPrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<typeof mockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findMe', () => {
    const userId = 'user-123';

    it('유저가 없으면 USER_NOT_FOUND 에러', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findMe(userId)).rejects.toThrow(
        new BaseException(USER_ERROR_CODES.USER_NOT_FOUND),
      );
    });

    it('유저가 있으면 passwordHash 제외하고 반환', async () => {
      const user = {
        id: userId,
        email: 'test@test.com',
        nickname: '테스터',
        role: Role.BUYER,
        status: UserStatus.ACTIVE,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findMe(userId);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });
  });

  describe('updateProfile', () => {
    const userId = 'user-123';

    it('닉네임을 수정하고 passwordHash 제외하고 반환', async () => {
      const updated = {
        id: userId,
        email: 'test@test.com',
        nickname: '새닉네임',
        role: Role.BUYER,
        status: UserStatus.ACTIVE,
        passwordHash: 'hashed',
      };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile(userId, {
        nickname: '새닉네임',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { nickname: '새닉네임' },
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.nickname).toBe('새닉네임');
    });
  });

  describe('findAll', () => {
    it('필터와 페이지네이션이 적용된 목록을 반환', async () => {
      const users = [
        {
          id: 'user-1',
          email: 'a@b.com',
          nickname: 'A',
          role: Role.BUYER,
          status: UserStatus.ACTIVE,
        },
        {
          id: 'user-2',
          email: 'b@c.com',
          nickname: 'B',
          role: Role.SELLER,
          status: UserStatus.ACTIVE,
        },
      ];
      prisma.user.findMany.mockResolvedValue(users);
      prisma.user.count.mockResolvedValue(2);

      const result = await service.findAll({
        role: Role.BUYER,
        status: UserStatus.ACTIVE,
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(users);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: Role.BUYER, status: UserStatus.ACTIVE },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('쿼리가 없으면 기본값(페이지 1, limit 20)으로 동작', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('updateStatus', () => {
    const userId = 'user-123';

    it('유저가 없으면 USER_NOT_FOUND 에러', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(userId, UserStatus.SUSPENDED),
      ).rejects.toThrow(new BaseException(USER_ERROR_CODES.USER_NOT_FOUND));
    });

    it('Super Admin이면 CANNOT_MODIFY_SUPER_ADMIN 에러', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        isSuperAdmin: true,
      });

      await expect(
        service.updateStatus(userId, UserStatus.SUSPENDED),
      ).rejects.toThrow(
        new BaseException(USER_ERROR_CODES.CANNOT_MODIFY_SUPER_ADMIN),
      );
    });

    it('정상적으로 상태를 변경하고 반환', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        isSuperAdmin: false,
      });
      prisma.user.update.mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        status: UserStatus.SUSPENDED,
        passwordHash: 'hashed',
      });

      const result = await service.updateStatus(userId, UserStatus.SUSPENDED);

      expect(result.status).toBe(UserStatus.SUSPENDED);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('updateRole', () => {
    const userId = 'user-123';

    it('유저가 없으면 USER_NOT_FOUND 에러', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateRole(userId, Role.ADMIN)).rejects.toThrow(
        new BaseException(USER_ERROR_CODES.USER_NOT_FOUND),
      );
    });

    it('Super Admin이면 CANNOT_MODIFY_SUPER_ADMIN 에러', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        isSuperAdmin: true,
      });

      await expect(service.updateRole(userId, Role.ADMIN)).rejects.toThrow(
        new BaseException(USER_ERROR_CODES.CANNOT_MODIFY_SUPER_ADMIN),
      );
    });

    it('정상적으로 역할을 변경하고 반환', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        isSuperAdmin: false,
      });
      prisma.user.update.mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        role: Role.ADMIN,
        passwordHash: 'hashed',
      });

      const result = await service.updateRole(userId, Role.ADMIN);

      expect(result.role).toBe(Role.ADMIN);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
