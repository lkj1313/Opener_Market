import { IsString, MinLength, MaxLength } from 'class-validator';

export class RejectSellerApplicationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  rejectReason: string;
}
