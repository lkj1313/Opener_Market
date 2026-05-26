import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// bcrypt 모듈 전체를 자동 Mock 처리
// → bcrypt.compare가 jest.fn()이 되어 mockResolvedValueOnce 등을 쓸 수 있음
jest.mock('bcrypt');

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BaseException } from '../common/exceptions/base.exception';
import { AUTH_ERROR_CODES } from './error-codes/auth.error-code';
import { Role } from '../generated/prisma/enums';

// AuthService 단위 테스트 그룹
describe('AuthService', () => {
  // 테스트에서 재사용할 변수 선언 (beforeEach에서 초기화)
  let service: any;
  let prisma: any;
  let jwtService: any;

  // PrismaService의 가짜(Mock) 구현
  // 실제 DB에 접근하지 않고 호출 기록과 반환값을 조작할 수 있음
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(), // 유저 조회 가짜 함수
      create: jest.fn(), // 유저 생성 가짜 함수
    },
  };

  // JwtService의 가짜(Mock) 구현
  // 실제 JWT 서명 대신 고정된 토큰 문자열을 반환
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-access-token'),
  };

  // 각 테스트(it) 실행 전에 매번 실행되는 설정
  beforeEach(async () => {
    // NestJS 테스트용 모듈 생성 (실제 DI 컨테이너 흉내)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, // 테스트 대상 서비스
        // 진짜 PrismaService 대신 가짜 객체를 주입하도록 설정
        { provide: PrismaService, useValue: mockPrismaService },
        // 진짜 JwtService 대신 가짜 객체를 주입하도록 설정
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    // 생성된 모듈에서 인스턴스 꺼내오기
    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // 각 테스트가 독립적으로 실행되도록 Mock 호출 기록 초기화
    jest.clearAllMocks();
  });

  // signup 메서드 테스트 그룹
  describe('signup', () => {
    // signup 테스트에서 공통으로 쓸 요청 데이터
    const dto = {
      email: 'test@test.com',
      password: 'password123',
      nickname: '테스터',
    };

    // 케이스 1: 이메일이 이미 존재하면 EMAIL_EXISTS 에러를 던져야 함
    it('이메일 중복 시 EMAIL_EXISTS 에러', async () => {
      // findUnique 호출 시 이미 존재하는 유저를 반환하도록 설정
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      // signup 실행 시 BaseException(AUTH_ERROR_CODES.EMAIL_EXISTS)가 발생해야 함
      await expect(service.signup(dto)).rejects.toThrow(
        new BaseException(AUTH_ERROR_CODES.EMAIL_EXISTS),
      );
    });

    // 케이스 2: 정상 회원가입 시 민감한 정보를 제외하고 필요한 필드만 반환
    it('정상 회원가입 시 id, email, nickname, role 반환', async () => {
      // findUnique 호출 시 null 반환 (중복 없음)
      prisma.user.findUnique.mockResolvedValue(null);
      // create 호출 시 가짜 유저 데이터 반환
      prisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: dto.email,
        nickname: dto.nickname,
        role: Role.BUYER,
        passwordHash: 'hashed',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.signup(dto);

      // 반환값에 passwordHash, status, createdAt 등이 포함되지 않는지 확인
      expect(result).toEqual({
        id: 'user-123',
        email: dto.email,
        nickname: dto.nickname,
        role: Role.BUYER,
      });
      // create 메서드가 올바른 데이터로 호출되었는지 확인
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          nickname: dto.nickname,
          role: Role.BUYER,
        }),
      });
    });
  });

  // login 메서드 테스트 그룹
  describe('login', () => {
    // login 테스트에서 공통으로 쓸 요청 데이터
    const dto = { email: 'test@test.com', password: 'password123' };
    // bcrypt 해시 형식을 흉낸 더미 해시 문자열
    const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwx';

    // 케이스 1: 이메일로 유저를 찾지 못하면 INVALID_CREDENTIALS 에러
    it('이메일 없음 시 INVALID_CREDENTIALS 에러', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        new BaseException(AUTH_ERROR_CODES.INVALID_CREDENTIALS),
      );
    });

    // 케이스 2: 비밀번호가 틀리면 INVALID_CREDENTIALS 에러
    it('비밀번호 틀림 시 INVALID_CREDENTIALS 에러', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: dto.email,
        passwordHash: hashedPassword,
      });

      // bcrypt.compare가 false를 반환하도록 Mock 설정
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(dto)).rejects.toThrow(
        new BaseException(AUTH_ERROR_CODES.INVALID_CREDENTIALS),
      );
    });

    // 케이스 3: 정상 로그인 시 accessToken과 유저 정보를 반환
    it('정상 로그인 시 accessToken과 유저 정보 반환', async () => {
      const user = {
        id: 'user-123',
        email: dto.email,
        nickname: '테스터',
        role: Role.BUYER,
        passwordHash: hashedPassword,
      };

      // 유저 조회 결과 설정
      prisma.user.findUnique.mockResolvedValue(user);
      // bcrypt.compare가 true를 반환하도록 Mock 설정
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(dto);

      // 반환값 검증
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        },
      });
      // JwtService.sign이 올바른 payload로 호출되었는지 확인
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    });
  });
});
