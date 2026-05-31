import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChargeWalletDto {
  @ApiProperty({ example: 10000, description: '충전 금액' })
  @IsInt()
  @Min(1)
  amount: number;
}
