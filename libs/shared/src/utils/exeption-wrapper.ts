/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class RpcExceptionWrapper implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();

    let error: any = {
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    if (exception instanceof RpcException) {
      // Already an RPC exception, just pass it through
      return throwError(() => exception);
    }

    if (exception instanceof HttpException) {
      // Convert HTTP exceptions to RPC exceptions
      const response = exception.getResponse();
      error = {
        message:
          typeof response === 'string'
            ? response
            : (response as any).message || exception.message,
        statusCode: exception.getStatus(),
        error:
          typeof response === 'object' ? (response as any).error : undefined,
      };
    } else if (exception instanceof Error) {
      // Handle regular errors
      error = {
        message: exception.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Log the exception for debugging
    console.error('RPC Exception:', {
      message: exception.message,
      stack: exception.stack,
      context: ctx.getData(),
    });

    return throwError(() => new RpcException(error));
  }
}
