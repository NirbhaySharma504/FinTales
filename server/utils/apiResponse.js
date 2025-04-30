/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler to catch async errors
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Handles specific MongoDB validation errors
 */
const handleMongooseError = (err) => {
  let error = { ...err };
  error.message = err.message;

  // Handle CastError - invalid ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Handle ValidationError - field validation failures
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Handle duplicate key error (code 11000)
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
    error = new AppError(message, 400);
  }

  return error;
};

module.exports = {
  AppError,
  asyncHandler,
  handleMongooseError
};