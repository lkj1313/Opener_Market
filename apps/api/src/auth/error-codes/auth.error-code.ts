import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const AUTH_ERROR_CODES: Record<string, ErrorCode> = {
  EMAIL_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'AUTH-001',
    message: '이미 사용 중인 이메일입니다.',
  },
  INVALID_CREDENTIALS: {
    status: HttpStatus.UNAUTHORIZED,
    code: 'AUTH-002',
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  },
  UNAUTHORIZED: {
    status: HttpStatus.UNAUTHORIZED,
    code: 'AUTH-003',
    message: '로그인이 필요합니다.',
  },
  FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    code: 'AUTH-004',
    message: '접근 권한이 없습니다.',
  },
};
