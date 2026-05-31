import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateProfileRequest } from '@opener/shared';

export class UpdateProfileDto implements UpdateProfileRequest {
  @ApiPropertyOptional({ example: '새닉네임', description: '닉네임 (2~20자)' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname?: string;
}
