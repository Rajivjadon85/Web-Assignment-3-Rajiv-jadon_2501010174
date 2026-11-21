const AppError = require('../utils/AppError');

// 404 Route Not Found
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Global Centralized Error Handler
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Validation Error from Mongoose
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Duplicate key (SKU unique index)
  if (err.code === 11000) {
    status = 409;
    const key = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate ${key}: "${err.keyValue?.[key]}" already exists`;
  }

  // Malformed JSON payload
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  }

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
};

module.exports = {
  notFound,
  errorHandler,
};
