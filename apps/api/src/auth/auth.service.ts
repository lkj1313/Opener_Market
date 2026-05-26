import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { AUTH_ERROR_CODES } from './error-codes/auth.error-code';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. 이메일 중복 체크
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BaseException(AUTH_ERROR_CODES.EMAIL_EXISTS);
    }

    // 2. 비밀번호 해싱
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. 유저 생성
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nickname: dto.nickname,
        role: dto.role ?? 'BUYER',
      },
    });

    // 4. 필요한 필드만 명시적으로 반환
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };
  }

  async login(dto: LoginDto) {
    // 1. 이메일로 유저 찾기
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BaseException(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
    }

    // 2. 비밀번호 비교
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new BaseException(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
    }

    // 3. JWT 발급
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }
}
