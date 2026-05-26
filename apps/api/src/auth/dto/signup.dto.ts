import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import type { SignupRequest } from '@opener/shared';
import { Role } from '../../generated/prisma/enums';

export class SignupDto implements SignupRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
