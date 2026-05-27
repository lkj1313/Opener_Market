import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { WALLET_ERROR_CODES } from './error-codes/wallet.error-code';
import { ChargeWalletDto } from './dto/charge-wallet.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 잔액 충전 (본인)
  async charge(dto: ChargeWalletDto, userId: string) {
    if (dto.amount < 1) {
      throw new BaseException(WALLET_ERROR_CODES.INVALID_AMOUNT);
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: dto.amount } },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'CHARGE',
          amount: dto.amount,
          balanceAfter: user.balance,
        },
      });

      return { userId, balance: user.balance };
    });
  }

  // 2. 내 잔액 조회
  async getMyBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    return { balance: user?.balance ?? 0 };
  }

  // 3. 내 거래 내역
  async getMyTransactions(userId: string) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
