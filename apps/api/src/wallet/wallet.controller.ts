import { Controller, Post, Get, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ChargeWalletDto } from './dto/charge-wallet.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // POST /wallet/charge
  // 내 잔액 충전 (본인만)
  @Post('charge')
  async charge(
    @Body() dto: ChargeWalletDto,
    @GetUser('userId') userId: string,
  ) {
    return this.walletService.charge(dto, userId);
  }

  // GET /wallet/balance
  // 내 잔액 조회
  @Get('balance')
  async getMyBalance(@GetUser('userId') userId: string) {
    return this.walletService.getMyBalance(userId);
  }

  // GET /wallet/transactions
  // 내 거래 내역
  @Get('transactions')
  async getMyTransactions(@GetUser('userId') userId: string) {
    return this.walletService.getMyTransactions(userId);
  }
}
