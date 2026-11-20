const mongoose = require('mongoose');
const ApiError = require('../utils/apiError');

const ALLOWED_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];

// Validate MongoDB ObjectId in request parameters
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new ApiError(`Invalid product ID format: "${id}"`, 400));
  }
  next();
};

// Validate body for creating a new product
const validateCreateProduct = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
    return next(new ApiError('Request body cannot be empty', 400));
  }

  const errors = [];
  const requiredFields = ['name', 'sku', 'category', 'price'];

  // Check required fields
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`Field '${field}' is required`);
    }
  }

  // Type checks
  const numericFields = ['price', 'quantity', 'reorderLevel'];
  for (const field of numericFields) {
    if (body[field] !== undefined && (typeof body[field] !== 'number' || Number.isNaN(body[field]))) {
      errors.push(`Field '${field}' must be a valid number`);
    }
  }

  const stringFields = ['name', 'sku', 'category', 'supplier'];
  for (const field of stringFields) {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      errors.push(`Field '${field}' must be a string`);
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(errors.join('; '), 400));
  }

  // Sanitize: keep only allowed schema fields
  const sanitized = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      sanitized[key] = body[key];
    }
  }
  req.body = sanitized;

  next();
};

// Validate body for updating product details
const validateUpdateProduct = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
    return next(new ApiError('Request body cannot be empty for an update', 400));
  }

  const errors = [];

  const numericFields = ['price', 'quantity', 'reorderLevel'];
  for (const field of numericFields) {
    if (body[field] !== undefined && (typeof body[field] !== 'number' || Number.isNaN(body[field]))) {
      errors.push(`Field '${field}' must be a valid number`);
    }
  }

  const stringFields = ['name', 'sku', 'category', 'supplier'];
  for (const field of stringFields) {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      errors.push(`Field '${field}' must be a string`);
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(errors.join('; '), 400));
  }

  // Sanitize: keep only allowed schema fields
  const sanitized = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      sanitized[key] = body[key];
    }
  }
  req.body = sanitized;

  next();
};

// Validate body for stock adjustment (PATCH /api/products/:id/stock)
const validateStockChange = (req, res, next) => {
  const { change } = req.body || {};

  if (typeof change !== 'number' || !Number.isInteger(change) || change === 0) {
    return next(
      new ApiError('Field "change" is required and must be a non-zero integer (positive to restock, negative for sale)', 400)
    );
  }

  next();
};

module.exports = {
  validateObjectId,
  validateCreateProduct,
  validateUpdateProduct,
  validateStockChange,
};
