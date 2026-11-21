const express = require('express');
const productController = require('../controllers/productController');
const {
  validateId,
  validateCreate,
  validateUpdate,
  validateStockChange,
} = require('../middleware/validate');

const router = express.Router();

router
  .route('/')
  .post(validateCreate, productController.createProduct)
  .get(productController.getProducts);

// Static endpoints before :id to prevent treating them as ID
router.get('/low-stock', productController.getLowStock);
router.get('/summary', productController.getSummary);

router.patch(
  '/:id/stock',
  validateId,
  validateStockChange,
  productController.adjustStock
);

router
  .route('/:id')
  .get(validateId, productController.getProductById)
  .put(validateId, validateUpdate, productController.updateProduct)
  .delete(validateId, productController.deleteProduct);

module.exports = router;
