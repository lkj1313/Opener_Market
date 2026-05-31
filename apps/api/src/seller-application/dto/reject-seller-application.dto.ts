import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { RejectSellerApplicationRequest } from '@opener/shared';

export class RejectSellerApplicationDto implements RejectSellerApplicationRequest {
  @ApiProperty({ example: '서류가 불충분합니다', description: '거부 사유 (1~500자)' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  rejectReason: string;
}
