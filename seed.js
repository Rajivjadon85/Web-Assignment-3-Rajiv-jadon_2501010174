require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const data = [
  { name: 'Ergonomic Mesh Chair', sku: 'FURN-CH-101', category: 'Furniture', price: 6499, quantity: 14, reorderLevel: 5, supplier: 'Featherlite' },
  { name: 'Standing Desk Converter', sku: 'FURN-DK-102', category: 'Furniture', price: 8299, quantity: 3, reorderLevel: 6, supplier: 'ErgoTech India' },
  { name: 'Wireless Gaming Mouse', sku: 'ELEC-MS-201', category: 'Electronics', price: 1899, quantity: 45, reorderLevel: 15, supplier: 'Razer India' },
  { name: 'Mechanical RGB Keyboard', sku: 'ELEC-KB-202', category: 'Electronics', price: 4299, quantity: 7, reorderLevel: 10, supplier: 'Keychron' },
  { name: 'Noise Cancelling Headphones', sku: 'ELEC-HP-203', category: 'Electronics', price: 9999, quantity: 20, reorderLevel: 5, supplier: 'Sony Electronics' },
  { name: 'USB-C 7-in-1 Hub', sku: 'ACCS-HB-301', category: 'Accessories', price: 2199, quantity: 32, reorderLevel: 12, supplier: 'Anker Innovations' },
  { name: 'Laptop Cooling Pad', sku: 'ACCS-CP-302', category: 'Accessories', price: 1299, quantity: 4, reorderLevel: 8, supplier: 'DeepCool' },
  { name: 'Hardcover Dot Journal', sku: 'SUPP-JN-401', category: 'Office Supplies', price: 350, quantity: 55, reorderLevel: 20, supplier: 'Factor Notes' },
  { name: 'Fineliner Drawing Pens 12-Pack', sku: 'SUPP-PN-402', category: 'Office Supplies', price: 420, quantity: 2, reorderLevel: 10, supplier: 'Staedtler' },
  { name: 'Stainless Steel Water Bottle 1L', sku: 'FITN-BT-501', category: 'Sports & Fitness', price: 799, quantity: 35, reorderLevel: 10, supplier: 'Milton' },
  { name: 'Adjustable Dumbbells Set 20kg', sku: 'FITN-DB-502', category: 'Sports & Fitness', price: 3499, quantity: 8, reorderLevel: 8, supplier: 'Kore Fitness' },
  { name: 'Anti-Skid Yoga Mat 6mm', sku: 'FITN-YM-503', category: 'Sports & Fitness', price: 899, quantity: 24, reorderLevel: 10, supplier: 'Boldfit' },
];

(async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventory_db';
    await mongoose.connect(mongoUri);
    await Product.deleteMany({});
    await Product.insertMany(data);
    console.log(`Seeded ${data.length} products`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
