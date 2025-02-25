import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {
  InternalError,
  UserDeletionError,
  UserNotFoundError,
} from '../utils/errors';
import { HttpAdapterHost } from '@nestjs/core';
import { DatabaseError } from 'pg';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';

@Catch(InternalError, DatabaseError)
export class InternalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: InternalError | DatabaseError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus: ErrorHttpStatusCode;
    let responseBody = {};

    if (exception instanceof InternalError) {
      httpStatus = this.getHttpStatusForInternalError(exception);
      responseBody = {
        ...this.getResponseBodyForInternalError(exception),
        ...responseBody,
      };
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        ...responseBody,
        message: 'Operation failed',
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getHttpStatusForInternalError(exception: InternalError) {
    if (exception instanceof UserDeletionError) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof UserNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getResponseBodyForInternalError(exception: InternalError) {
    if (exception instanceof UserDeletionError) {
      return {
        message: 'Operation failed',
      };
    } else if (exception instanceof UserNotFoundError) {
      return {
        message: exception.message,
      };
    }
    return {};
  }
}
