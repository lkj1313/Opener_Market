import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { SELLER_APPLICATION_ERROR_CODES } from './error-codes/seller-application.error-code';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto';
import { RejectSellerApplicationDto } from './dto/reject-seller-application.dto';
import { Role } from '../generated/prisma/enums';
import { SellerApplicationStatus } from '../generated/prisma/enums';

@Injectable()
export class SellerApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 판매자 신청 제출
  async create(dto: CreateSellerApplicationDto, userId: string) {
    // 1-1. 이미 판매자인지 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (user?.role === Role.SELLER) {
      throw new BaseException(SELLER_APPLICATION_ERROR_CODES.ALREADY_SELLER);
    }

    // 1-2. 이미 진행 중인 신청이 있는지 확인
    const existing = await this.prisma.sellerApplication.findUnique({
      where: { userId },
    });
    if (existing?.status === SellerApplicationStatus.PENDING) {
      throw new BaseException(SELLER_APPLICATION_ERROR_CODES.APPLICATION_EXISTS);
    }

    // 1-3. 신청 생성
    const application = await this.prisma.sellerApplication.create({
      data: {
        userId,
        shopName: dto.shopName,
        businessAddress: dto.businessAddress,
        returnAddress: dto.returnAddress ?? null,
      },
    });

    return application;
  }

  // 2. 내 신청 조회
  async findMyApplication(userId: string) {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { userId },
    });

    if (!application) {
      throw new BaseException(
        SELLER_APPLICATION_ERROR_CODES.APPLICATION_NOT_FOUND,
      );
    }

    return application;
  }

  // 3. 전체 신청 목록 (Admin용)
  async findAll() {
    return this.prisma.sellerApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nickname: true,
            role: true,
          },
        },
      },
    });
  }

  // 4. 신청 승인 (트랜잭션 처리)
  async approve(id: string) {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new BaseException(
        SELLER_APPLICATION_ERROR_CODES.APPLICATION_NOT_FOUND,
      );
    }

    if (application.status !== SellerApplicationStatus.PENDING) {
      throw new BaseException(
        SELLER_APPLICATION_ERROR_CODES.ALREADY_REVIEWED,
      );
    }

    // 트랜잭션: 신청 승인 + 유저 역할 변경 + Seller 레코드 생성
    const [updatedApplication] = await this.prisma.$transaction([
      this.prisma.sellerApplication.update({
        where: { id },
        data: {
          status: SellerApplicationStatus.APPROVED,
          reviewedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: application.userId },
        data: { role: Role.SELLER },
      }),
      this.prisma.seller.create({
        data: {
          userId: application.userId,
          shopName: application.shopName,
          businessAddress: application.businessAddress,
          returnAddress: application.returnAddress,
        },
      }),
    ]);

    return updatedApplication;
  }

  // 5. 신청 거부
  async reject(id: string, dto: RejectSellerApplicationDto) {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new BaseException(
        SELLER_APPLICATION_ERROR_CODES.APPLICATION_NOT_FOUND,
      );
    }

    if (application.status !== SellerApplicationStatus.PENDING) {
      throw new BaseException(
        SELLER_APPLICATION_ERROR_CODES.ALREADY_REVIEWED,
      );
    }

    return this.prisma.sellerApplication.update({
      where: { id },
      data: {
        status: SellerApplicationStatus.REJECTED,
        rejectReason: dto.rejectReason,
        reviewedAt: new Date(),
      },
    });
  }
}
