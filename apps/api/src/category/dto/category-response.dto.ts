import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: '카테고리 ID' })
  id: string;

  @ApiProperty({ description: '카테고리명' })
  name: string;

  @ApiProperty({ description: '슬러그' })
  slug: string;

  @ApiProperty({ description: '부모 카테고리 ID', nullable: true })
  parentId: string | null;

  @ApiProperty({ description: '생성일', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', type: 'string', format: 'date-time' })
  updatedAt: Date;
}
