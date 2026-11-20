require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const productRoutes = require('./src/routes/productRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Inventory and Data Management System API',
    assignment: 'Web Development Assignment 3',
    author: 'Rajiv Jadon (2501010174)',
    status: 'Running',
    endpoints: {
      'POST /api/products': 'Create product',
      'GET /api/products': 'List products (supports category, supplier, search, minPrice, maxPrice, sort, page, limit)',
      'GET /api/products/low-stock': 'Get items with quantity <= reorderLevel',
      'GET /api/products/summary': 'Category-level aggregation summary',
      'GET /api/products/:id': 'Get single product details',
      'PUT /api/products/:id': 'Update product details',
      'PATCH /api/products/:id/stock': 'Adjust stock (body: { change: number })',
      'DELETE /api/products/:id': 'Delete product by ID',
    },
  });
});

// API Routes
app.use('/api/products', productRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Server Initiation
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`Server started on: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Author: Rajiv Jadon (Roll No: 2501010174)`);
    console.log(`===============================================`);
  });
});
