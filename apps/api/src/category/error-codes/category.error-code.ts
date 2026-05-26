import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const CATEGORY_ERROR_CODES: Record<string, ErrorCode> = {
  CATEGORY_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'CATEGORY-001',
    message: '카테고리를 찾을 수 없습니다.',
  },
  SLUG_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'CATEGORY-002',
    message: '이미 사용 중인 슬러그입니다.',
  },
};
