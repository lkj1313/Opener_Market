import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const SELLER_APPLICATION_ERROR_CODES: Record<string, ErrorCode> = {
  ALREADY_SELLER: {
    status: HttpStatus.CONFLICT,
    code: 'SELLER-001',
    message: '이미 판매자 권한을 보유하고 있습니다.',
  },
  APPLICATION_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'SELLER-002',
    message: '이미 진행 중인 판매자 신청이 존재합니다.',
  },
  APPLICATION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'SELLER-003',
    message: '신청 내역을 찾을 수 없습니다.',
  },
  ALREADY_REVIEWED: {
    status: HttpStatus.CONFLICT,
    code: 'SELLER-004',
    message: '이미 처리가 완료된 신청입니다.',
  },
  SHOP_NAME_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'SELLER-005',
    message: '이미 사용 중인 상점명입니다.',
  },
};
