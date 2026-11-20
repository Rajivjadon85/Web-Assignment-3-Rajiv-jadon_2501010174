const Product = require('../models/Product');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

// Allowed sort fields to prevent unexpected query injections
const ALLOWED_SORT_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'createdAt', 'updatedAt'];

// Helper to escape special regex characters for safe search
const safeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// 1. Create a new product
// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json(newProduct);
});

// 2. Get list of products with search, filter, sort, and pagination
// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, sort } = req.query;

  // Build filter query object
  const filterQuery = {};

  if (category) {
    filterQuery.category = { $regex: `^${safeRegex(category.trim())}$`, $options: 'i' };
  }

  if (supplier) {
    filterQuery.supplier = { $regex: `^${safeRegex(supplier.trim())}$`, $options: 'i' };
  }

  if (search) {
    filterQuery.name = { $regex: safeRegex(search.trim()), $options: 'i' };
  }

  // Price range filters
  const priceFilter = {};
  if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
    priceFilter.$gte = Number(minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
    priceFilter.$lte = Number(maxPrice);
  }
  if (Object.keys(priceFilter).length > 0) {
    filterQuery.price = priceFilter;
  }

  // Sort configuration (supports format: -price,name)
  let sortCriteria = { createdAt: -1 };
  if (sort) {
    const fields = String(sort).split(',');
    const parsedSort = {};

    fields.forEach((item) => {
      const cleanItem = item.trim();
      const isDescending = cleanItem.startsWith('-');
      const fieldName = cleanItem.replace(/^-/, '');

      if (ALLOWED_SORT_FIELDS.includes(fieldName)) {
        parsedSort[fieldName] = isDescending ? -1 : 1;
      }
    });

    if (Object.keys(parsedSort).length > 0) {
      sortCriteria = parsedSort;
    }
  }

  // Pagination configuration
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  // Run count and query in parallel for better performance
  const [total, products] = await Promise.all([
    Product.countDocuments(filterQuery),
    Product.find(filterQuery).sort(sortCriteria).skip(skip).limit(limit),
  ]);

  res.status(200).json({
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    count: products.length,
    products,
  });
});

// 3. Get low stock products (quantity <= reorderLevel)
// GET /api/products/low-stock
const getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  }).sort({ quantity: 1 });

  res.status(200).json({
    count: lowStockItems.length,
    lowStockItems,
  });
});

// 4. Category-wise inventory summary using MongoDB Aggregation
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
    {
      $project: {
        _id: 1,
        totalItems: 1,
        totalQuantity: 1,
        totalStockValue: 1,
        avgPrice: { $round: ['$avgPrice', 2] },
      },
    },
    {
      $sort: { totalStockValue: -1 },
    },
  ]);

  res.status(200).json({
    categories: summary.length,
    summary,
  });
});

// 5. Get a single product by ID
// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(`Product not found with ID: ${req.params.id}`, 404);
  }
  res.status(200).json(product);
});

// 6. Update product details (partial update)
// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new ApiError(`Product not found with ID: ${req.params.id}`, 404);
  }

  res.status(200).json(updatedProduct);
});

// 7. Adjust stock level (atomic increment/decrement)
// PATCH /api/products/:id/stock
const adjustStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { change } = req.body;

  // Filter guard: if reducing inventory, ensure existing quantity is >= reduction amount
  const query = { _id: id };
  if (change < 0) {
    query.quantity = { $gte: Math.abs(change) };
  }

  // Atomic update using MongoDB $inc
  const updatedProduct = await Product.findOneAndUpdate(
    query,
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    const itemExists = await Product.exists({ _id: id });
    if (!itemExists) {
      throw new ApiError(`Product not found with ID: ${id}`, 404);
    }
    throw new ApiError('Insufficient stock: Quantity cannot drop below zero', 400);
  }

  res.status(200).json({
    message: 'Stock updated',
    product: updatedProduct,
  });
});

// 8. Delete a product
// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    throw new ApiError(`Product not found with ID: ${req.params.id}`, 404);
  }

  res.status(200).json({
    message: 'Product deleted',
    id: deletedProduct.id,
  });
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
