import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const PRODUCT_ERROR_CODES: Record<string, ErrorCode> = {
  PRODUCT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PRODUCT-001',
    message: '상품을 찾을 수 없습니다.',
  },
  PRODUCT_FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    code: 'PRODUCT-002',
    message: '해당 상품에 대한 권한이 없습니다.',
  },
  INVALID_STATUS: {
    status: HttpStatus.BAD_REQUEST,
    code: 'PRODUCT-003',
    message: '유효하지 않은 상품 상태입니다.',
  },
  INVALID_KEYWORD: {
    status: HttpStatus.BAD_REQUEST,
    code: 'PRODUCT-004',
    message: '검색어는 2글자 이상 입력해야 합니다.',
  },
};
