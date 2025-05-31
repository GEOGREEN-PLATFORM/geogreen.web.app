export class AppError extends Error {
  statusCode: number;
  data?: any;
  originalError?: any;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      data?: any;
      originalError?: any;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = options?.statusCode || 500;
    this.data = options?.data;
    this.originalError = options?.originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
