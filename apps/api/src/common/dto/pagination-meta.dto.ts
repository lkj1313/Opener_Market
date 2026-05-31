import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지당 개수' })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}
