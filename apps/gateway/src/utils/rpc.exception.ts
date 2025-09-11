import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

interface RpcError {
  message: string | string[];
  error: {
    message?: string;
    statusCode?: number;
  };
}

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const error = exception.getError() as RpcError;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(error?.error?.statusCode || 500)
      .json(
        error.error || { message: error.message || 'Internal server error' },
      );
  }
}
