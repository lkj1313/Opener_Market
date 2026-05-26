import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const CART_ERROR_CODES: Record<string, ErrorCode> = {
  CART_ITEM_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'CART-001',
    message: '장바구니 항목을 찾을 수 없습니다.',
  },
  INVALID_QUANTITY: {
    status: HttpStatus.BAD_REQUEST,
    code: 'CART-002',
    message: '수량은 1 이상이어야 합니다.',
  },
  PRODUCT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'CART-003',
    message: '해당 상품을 찾을 수 없습니다.',
  },
};
