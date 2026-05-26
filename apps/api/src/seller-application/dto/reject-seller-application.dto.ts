import { IsString, MinLength, MaxLength } from 'class-validator';
import type { RejectSellerApplicationRequest } from '@opener/shared';

export class RejectSellerApplicationDto implements RejectSellerApplicationRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  rejectReason: string;
}
