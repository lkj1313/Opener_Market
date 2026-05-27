import { IsInt, Min } from 'class-validator';

export class ChargeWalletDto {
  @IsInt()
  @Min(1)
  amount: number;
}
