import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../generated/prisma/enums';

export class SignupDto {
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
