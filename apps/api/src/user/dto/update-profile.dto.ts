import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import type { UpdateProfileRequest } from '@opener/shared';

export class UpdateProfileDto implements UpdateProfileRequest {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname?: string;
}
