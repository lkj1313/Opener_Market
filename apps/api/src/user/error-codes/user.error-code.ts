import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const USER_ERROR_CODES: Record<string, ErrorCode> = {
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'USER-001',
    message: '사용자를 찾을 수 없습니다.',
  },
  CANNOT_MODIFY_SUPER_ADMIN: {
    status: HttpStatus.FORBIDDEN,
    code: 'USER-002',
    message: '시스템 관리자는 수정할 수 없습니다.',
  },
};
