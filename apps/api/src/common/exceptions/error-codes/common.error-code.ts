import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-code.interface';

export const COMMON_ERROR_CODES: Record<string, ErrorCode> = {
  // 인증/권한
  UNAUTHORIZED: {
    status: HttpStatus.UNAUTHORIZED,
    code: 'COMMON-001',
    message: '로그인이 필요합니다.',
  },
  FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    code: 'COMMON-002',
    message: '접근 권한이 없습니다.',
  },

  // DB/Prisma
  DUPLICATE_DATA: {
    status: HttpStatus.CONFLICT,
    code: 'COMMON-003',
    message: '이미 존재하는 데이터입니다.',
  },
  DATA_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'COMMON-004',
    message: '데이터를 찾을 수 없습니다.',
  },

  // 입력값 검증
  INVALID_INPUT: {
    status: HttpStatus.BAD_REQUEST,
    code: 'COMMON-005',
    message: '잘못된 요청입니다.',
  },

  // 서버 내
  INTERNAL_SERVER_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'COMMON-999',
    message: '서버 내 오류가 발생했습니다.',
  },
};
