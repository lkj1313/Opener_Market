import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const ORDER_ERROR_CODES: Record<string, ErrorCode> = {
  ORDER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'ORDER-001',
    message: '주문을 찾을 수 없습니다.',
  },
  SUB_ORDER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'ORDER-002',
    message: '주문 항목을 찾을 수 없습니다.',
  },
  ORDER_FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    code: 'ORDER-003',
    message: '해당 주문에 대한 권한이 없습니다.',
  },
  CART_EMPTY: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ORDER-004',
    message: '장바구니가 비어있습니다.',
  },
  STOCK_INSUFFICIENT: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ORDER-005',
    message: '상품 재고가 부족합니다.',
  },
  CANNOT_CANCEL: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ORDER-006',
    message: '취소할 수 없는 주문 상태입니다.',
  },
  ALREADY_PAID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ORDER-007',
    message: '이미 결제된 주문입니다.',
  },
  INSUFFICIENT_BALANCE: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ORDER-008',
    message: '잔액이 부족합니다.',
  },
};
