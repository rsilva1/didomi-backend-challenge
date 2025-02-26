import { DatabaseError } from "pg"
import { InternalExceptionFilter } from "./internal-exception.filter"
import { ArgumentsHost } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { EmailAlreadyExistsError, InternalError, UserDeletionError, UserNotFoundError } from "../utils/errors"
import { randomUUID } from "crypto"

describe('InternalExceptionFilter', () => {
  let httpAdapterHost: HttpAdapterHost
  let host: ArgumentsHost
  beforeEach(() => {
    httpAdapterHost = {
      httpAdapter: {
        reply: jest.fn(),
      }
    } as unknown as HttpAdapterHost
    host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ArgumentsHost
  })

  it('filters DatabaseError', () => {
    new InternalExceptionFilter(httpAdapterHost).catch(
      new DatabaseError("unknown", 0, "error"),
      host
    )

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ message: 'Operation failed' }),
      500
    )
  })

  it('filters non-specific InternalError', () => {
    new InternalExceptionFilter(httpAdapterHost).catch(
      new InternalError("secret internal detail"),
      host
    )

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ message: 'Operation failed' }),
      500
    )
  })

  it('filters UserDeletionError', () => {
    new InternalExceptionFilter(httpAdapterHost).catch(
      new UserDeletionError("userId"),
      host
    )

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ message: 'Operation failed' }),
      500
    )
  })

  it('filters EmailAlreadyExistsError', () => {
    new InternalExceptionFilter(httpAdapterHost).catch(
      new EmailAlreadyExistsError("repeated@email.com"),
      host
    )

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: expect.stringMatching(/email.*exists/i)
      }),
      400
    )
  })

  it('filters UserNotFoundError', () => {
    const userId = randomUUID()
    new InternalExceptionFilter(httpAdapterHost).catch(
      new UserNotFoundError(userId),
      host
    )

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: `User ${userId} not found`
      }),
      404
    )
  })
})
