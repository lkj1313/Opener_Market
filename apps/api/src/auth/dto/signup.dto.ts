import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SignupRequest } from '@opener/shared';
import { Role } from '../../generated/prisma/enums';

export class SignupDto implements SignupRequest {
  @ApiProperty({ example: 'user@example.com', description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (8자 이상)' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '닉네임', description: '닉네임 (2~20자)' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;

  @ApiPropertyOptional({ example: 'BUYER', description: '역할 (기본: BUYER)', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
