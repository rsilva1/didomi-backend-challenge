export class InternalError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class UserDeletionError extends InternalError {
  constructor(userId: string) {
    super(`User ${userId} could not be deleted`);
  }
}

export class UserNotFoundError extends InternalError {
  constructor(userId: string) {
    super(`User ${userId} not found`);
  }
}

export class EmailAlreadyExistsError extends InternalError {
  constructor(email: string) {
    super(`Email ${email} already exists`);
  }
}
