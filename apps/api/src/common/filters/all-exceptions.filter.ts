import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base.exception';
import { COMMON_ERROR_CODES } from '../exceptions/error-codes/common.error-code';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let code: string;
    let message: string;

    if (exception instanceof BaseException) {
      statusCode = exception.errorCode.status;
      code = exception.errorCode.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      code = `HTTP-${statusCode}`;
      const responseBody = exception.getResponse();
      message =
        typeof responseBody === 'string'
          ? responseBody
          : (responseBody as any).message || 'Bad Request';
    } else {
      console.error('Unexpected error:', exception);
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      code = COMMON_ERROR_CODES.INTERNAL_SERVER_ERROR.code;
      message = COMMON_ERROR_CODES.INTERNAL_SERVER_ERROR.message;
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      code,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
