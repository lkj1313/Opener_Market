import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code.interface';

export const WALLET_ERROR_CODES: Record<string, ErrorCode> = {
  INSUFFICIENT_BALANCE: {
    status: HttpStatus.BAD_REQUEST,
    code: 'WALLET-001',
    message: '잔액이 부족합니다.',
  },
  INVALID_AMOUNT: {
    status: HttpStatus.BAD_REQUEST,
    code: 'WALLET-002',
    message: '금액은 1원 이상이어야 합니다.',
  },
};
