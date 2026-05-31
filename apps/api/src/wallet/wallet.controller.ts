import { Controller, Post, Get, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { ChargeWalletDto } from './dto/charge-wallet.dto';
import { WalletBalanceResponseDto } from './dto/wallet-balance-response.dto';
import { WalletChargeResponseDto } from './dto/wallet-charge-response.dto';
import { WalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('charge')
  @ApiOperation({ summary: '내 잔액 충전' })
  @ApiBody({ type: ChargeWalletDto })
  @ApiResponse({ status: 200, description: '충전 성공', type: WalletChargeResponseDto })
  async charge(
    @Body() dto: ChargeWalletDto,
    @GetUser('userId') userId: string,
  ) {
    return this.walletService.charge(dto, userId);
  }

  @Get('balance')
  @ApiOperation({ summary: '내 잔액 조회' })
  @ApiResponse({ status: 200, description: '잔액', type: WalletBalanceResponseDto })
  async getMyBalance(@GetUser('userId') userId: string) {
    return this.walletService.getMyBalance(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: '내 거래 내역' })
  @ApiResponse({ status: 200, description: '거래 내역', type: [WalletTransactionResponseDto] })
  async getMyTransactions(@GetUser('userId') userId: string) {
    return this.walletService.getMyTransactions(userId);
  }
}
