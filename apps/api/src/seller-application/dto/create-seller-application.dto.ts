import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateSellerApplicationRequest } from '@opener/shared';

export class CreateSellerApplicationDto implements CreateSellerApplicationRequest {
  @ApiProperty({ example: '내 상점', description: '상점명 (2~50자)' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shopName: string;

  @ApiProperty({ example: '서울시 강남구...', description: '사업장 주소 (5~200자)' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  businessAddress: string;

  @ApiPropertyOptional({ example: '서울시 강남구...', description: '반품 주소 (5~200자)' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  returnAddress?: string;
}
