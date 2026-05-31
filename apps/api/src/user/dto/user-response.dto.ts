import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '../../generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '역할', enum: Role })
  role: Role;

  @ApiProperty({ description: '계정 상태', enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ description: '슈퍼관리자 여부' })
  isSuperAdmin: boolean;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
