const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const SORTABLE_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'createdAt', 'updatedAt'];
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, sort } = req.query;

  const filter = {};
  if (category) filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
  if (supplier) filter.supplier = new RegExp(`^${escapeRegex(supplier.trim())}$`, 'i');
  if (search) filter.name = new RegExp(escapeRegex(search.trim()), 'i');

  const priceFilter = {};
  if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
    priceFilter.$gte = Number(minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
    priceFilter.$lte = Number(maxPrice);
  }
  if (Object.keys(priceFilter).length > 0) filter.price = priceFilter;

  // Sorting
  let sortBy = { createdAt: -1 };
  if (sort) {
    const parsedSort = {};
    String(sort).split(',').forEach((field) => {
      const trimmed = field.trim();
      const isDesc = trimmed.startsWith('-');
      const key = trimmed.replace(/^-/, '');
      if (SORTABLE_FIELDS.includes(key)) {
        parsedSort[key] = isDesc ? -1 : 1;
      }
    });
    if (Object.keys(parsedSort).length > 0) sortBy = parsedSort;
  }

  // Pagination
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(sortBy).skip(skip).limit(limit),
  ]);

  res.json({
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    count: products.length,
    products,
  });
});

// GET /api/products/low-stock
const getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  }).sort({ quantity: 1 });

  res.json({ count: lowStockItems.length, lowStockItems });
});

// GET /api/products/summary
const getSummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $set: { avgPrice: { $round: ['$avgPrice', 2] } } },
    { $sort: { totalStockValue: -1 } },
  ]);

  res.json({ categories: summary.length, summary });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

// PATCH /api/products/:id/stock
const adjustStock = asyncHandler(async (req, res) => {
  const { change } = req.body;
  const filter = { _id: req.params.id };

  // If sale (negative), ensure quantity is sufficient
  if (change < 0) {
    filter.quantity = { $gte: Math.abs(change) };
  }

  const product = await Product.findOneAndUpdate(
    filter,
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) throw new AppError('Product not found', 404);
    throw new AppError('Insufficient stock for this change', 400);
  }

  res.json({ message: 'Stock updated', product });
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ message: 'Product deleted', id: product.id });
});

module.exports = {
  createProduct,
  getProducts,
  getLowStock,
  getSummary,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
};
