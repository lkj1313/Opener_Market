import { ApiProperty } from '@nestjs/swagger';

export class WalletBalanceResponseDto {
  @ApiProperty({ description: '현재 잔액' })
  balance: number;
}
