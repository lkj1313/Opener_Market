import { IsEmail, IsString } from 'class-validator';
import type { LoginRequest } from '@opener/shared';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
