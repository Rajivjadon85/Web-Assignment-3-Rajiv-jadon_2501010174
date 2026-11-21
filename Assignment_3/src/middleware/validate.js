const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const ALLOWED_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];
const REQUIRED_FIELDS = ['name', 'sku', 'category', 'price'];

// Check valid MongoDB ObjectId
const validateId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid product ID', 400));
  }
  next();
};

// Check request body for create & update
const checkBody = (isUpdate) => (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
    return next(new AppError('Request body cannot be empty', 400));
  }

  const errors = [];

  if (!isUpdate) {
    REQUIRED_FIELDS.forEach((field) => {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        errors.push(`${field} is required`);
      }
    });
  }

  ['price', 'quantity', 'reorderLevel'].forEach((field) => {
    if (body[field] !== undefined && (typeof body[field] !== 'number' || Number.isNaN(body[field]))) {
      errors.push(`${field} must be a number`);
    }
  });

  ['name', 'sku', 'category', 'supplier'].forEach((field) => {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }
  });

  if (errors.length > 0) {
    return next(new AppError(errors.join(', '), 400));
  }

  // Filter allowed fields only
  const filtered = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      filtered[field] = body[field];
    }
  });
  req.body = filtered;

  next();
};

const validateCreate = checkBody(false);
const validateUpdate = checkBody(true);

// Check stock update change field
const validateStockChange = (req, res, next) => {
  const { change } = req.body || {};
  if (typeof change !== 'number' || !Number.isInteger(change) || change === 0) {
    return next(new AppError('"change" must be a non-zero integer', 400));
  }
  next();
};

module.exports = {
  validateId,
  validateCreate,
  validateUpdate,
  validateStockChange,
};
