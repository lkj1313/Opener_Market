import { ApiProperty } from '@nestjs/swagger';

export class CategoryTreeResponseDto {
  @ApiProperty({ description: '카테고리 ID' })
  id: string;

  @ApiProperty({ description: '카테고리명' })
  name: string;

  @ApiProperty({ description: '슬러그' })
  slug: string;

  @ApiProperty({ description: '부모 카테고리 ID', nullable: true })
  parentId: string | null;

  @ApiProperty({ description: '하위 카테고리 목록', type: [CategoryTreeResponseDto] })
  children: CategoryTreeResponseDto[];
}
