import { ApiProperty } from '@nestjs/swagger';

export class WalletChargeResponseDto {
  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '충전 후 잔액' })
  balance: number;
}
