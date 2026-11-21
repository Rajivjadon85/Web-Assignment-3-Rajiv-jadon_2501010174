require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const productRoutes = require('./src/routes/productRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Inventory API is running',
    student: 'Rajiv Jadon',
    rollNumber: '2501010174',
  });
});

// Routes
app.use('/api/products', productRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
