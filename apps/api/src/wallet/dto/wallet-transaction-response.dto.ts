import { ApiProperty } from '@nestjs/swagger';

export class WalletTransactionResponseDto {
  @ApiProperty({ description: '거래 ID' })
  id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '거래 유형 (CHARGE, USE)' })
  type: string;

  @ApiProperty({ description: '거래 금액' })
  amount: number;

  @ApiProperty({ description: '거래 후 잔액' })
  balanceAfter: number;

  @ApiProperty({ description: '주문 ID', nullable: true })
  orderId: string | null;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
