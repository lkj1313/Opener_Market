import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { UserResponseDto } from './user-response.dto';

export class UserListResponseDto {
  @ApiProperty({ description: '사용자 목록', type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ description: '페이지네이션 메타', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
