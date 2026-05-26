import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const SHOP_DISCOUNT_ERROR_CODES: Record<string, ErrorCode> = {
  SHOP_DISCOUNT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'SHOP-DISCOUNT-001',
    message: '상점 할인을 찾을 수 없습니다.',
  },
  SHOP_DISCOUNT_FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    code: 'SHOP-DISCOUNT-002',
    message: '해당 상점 할인에 대한 권한이 없습니다.',
  },
};
