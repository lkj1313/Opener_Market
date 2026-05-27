import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const REVIEW_ERROR_CODES: Record<string, ErrorCode> = {
  REVIEW_ORDER_ITEM_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'REVIEW-001',
    message: '해당 주문 품목을 찾을 수 없습니다.',
  },
  REVIEW_NOT_PURCHASED: {
    status: HttpStatus.FORBIDDEN,
    code: 'REVIEW-002',
    message: '구매 확정된 상품만 리뷰를 작성할 수 있습니다.',
  },
  REVIEW_ALREADY_EXISTS: {
    status: HttpStatus.BAD_REQUEST,
    code: 'REVIEW-003',
    message: '이미 리뷰를 작성한 주문 품목입니다.',
  },
  REVIEW_INVALID_RATING: {
    status: HttpStatus.BAD_REQUEST,
    code: 'REVIEW-004',
    message: '별점은 1점에서 5점 사이여야 합니다.',
  },
  REVIEW_FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    code: 'REVIEW-005',
    message: '해당 리뷰에 대한 권한이 없습니다.',
  },
  REVIEW_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'REVIEW-006',
    message: '리뷰를 찾을 수 없습니다.',
  },
};
