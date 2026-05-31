import { ApiProperty } from '@nestjs/swagger';
import { SellerApplicationStatus } from '../../generated/prisma/enums';
import { SellerApplicationUserDto } from './seller-application-user-response.dto';

export class SellerApplicationResponseDto {
  @ApiProperty({ description: '신청 ID' })
  id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '상점명' })
  shopName: string;

  @ApiProperty({ description: '사업장 주소' })
  businessAddress: string;

  @ApiProperty({ description: '반품 주소', nullable: true })
  returnAddress: string | null;

  @ApiProperty({ description: '신청 상태', enum: SellerApplicationStatus })
  status: SellerApplicationStatus;

  @ApiProperty({ description: '거부 사유', nullable: true })
  rejectReason: string | null;

  @ApiProperty({ description: '신청자 정보', type: SellerApplicationUserDto, nullable: true })
  user?: SellerApplicationUserDto;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ description: '검토일', type: 'string', format: 'date-time', nullable: true })
  reviewedAt: Date | null;
}
