const ApiError = require('../utils/apiError');

// 404 Route Not Found Middleware
const notFound = (req, res, next) => {
  next(new ApiError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404));
};

// Global Error Handling Middleware
// Handles operational errors, Mongoose validations, duplicates, and server exceptions
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((item) => item.message);
    message = errors.join(', ');
  }

  // Mongoose invalid ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}'`;
  }

  // MongoDB duplicate key error (code 11000) e.g. duplicate SKU
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate key error: Product with ${field} '${value}' already exists`;
  }

  // Express JSON parser body error
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON body in request';
  }

  // Log unexpected errors
  if (statusCode === 500) {
    console.error('[Internal Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
