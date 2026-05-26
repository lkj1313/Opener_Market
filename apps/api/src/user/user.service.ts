import { Injectable } from '@nestjs/common';
import { calculateSkip, createPaginatedResult, normalizePagination } from '@opener/shared';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { USER_ERROR_CODES } from './error-codes/user.error-code';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role, UserStatus } from '../generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 내 정보 조회
  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BaseException(USER_ERROR_CODES.USER_NOT_FOUND);
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  // 2. 내 정보 수정
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        nickname: dto.nickname,
      },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  // 3. 전체 사용자 목록 (Admin용)
  async findAll(query: { role?: Role; status?: UserStatus; page?: number; limit?: number }) {
    const { page, limit } = normalizePagination(query.page, query.limit);
    const skip = calculateSkip(page, limit);

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          nickname: true,
          role: true,
          status: true,
          isSuperAdmin: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResult(users, total, page, limit);
  }

  // 4. 계정 정지/활성화 (Admin용)
  async updateStatus(id: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new BaseException(USER_ERROR_CODES.USER_NOT_FOUND);
    }

    if (user.isSuperAdmin) {
      throw new BaseException(USER_ERROR_CODES.CANNOT_MODIFY_SUPER_ADMIN);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    const { passwordHash, ...result } = updated;
    return result;
  }

  // 5. 역할 변경 (Admin용)
  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new BaseException(USER_ERROR_CODES.USER_NOT_FOUND);
    }

    if (user.isSuperAdmin) {
      throw new BaseException(USER_ERROR_CODES.CANNOT_MODIFY_SUPER_ADMIN);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    const { passwordHash, ...result } = updated;
    return result;
  }
}
