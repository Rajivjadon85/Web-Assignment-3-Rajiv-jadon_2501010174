const express = require('express');
const productController = require('../controllers/productController');
const {
  validateObjectId,
  validateCreateProduct,
  validateUpdateProduct,
  validateStockChange,
} = require('../middleware/validation');

const router = express.Router();

// Collection routes (Create and List with Query Params)
router
  .route('/')
  .post(validateCreateProduct, productController.createProduct)
  .get(productController.getProducts);

// Specific aggregate routes
// IMPORTANT: These static routes must precede /:id to prevent Express from treating 'low-stock' or 'summary' as an ID
router.get('/low-stock', productController.getLowStock);
router.get('/summary', productController.getSummary);

// Stock adjustment route (Restock / Sale)
router.patch(
  '/:id/stock',
  validateObjectId,
  validateStockChange,
  productController.adjustStock
);

// Individual item routes (Read, Update, Delete)
router
  .route('/:id')
  .get(validateObjectId, productController.getProductById)
  .put(validateObjectId, validateUpdateProduct, productController.updateProduct)
  .delete(validateObjectId, productController.deleteProduct);

module.exports = router;
