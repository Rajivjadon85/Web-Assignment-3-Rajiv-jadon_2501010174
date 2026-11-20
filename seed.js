require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// Sample inventory dataset for development & testing
// Prepared by Rajiv Jadon (2501010174)
const sampleProducts = [
  {
    name: 'Ergonomic Mesh Chair',
    sku: 'FURN-CH-101',
    category: 'Furniture',
    price: 6499,
    quantity: 14,
    reorderLevel: 5,
    supplier: 'Featherlite',
  },
  {
    name: 'Standing Desk Converter',
    sku: 'FURN-DK-102',
    category: 'Furniture',
    price: 8299,
    quantity: 3,
    reorderLevel: 6,
    supplier: 'ErgoTech India',
  },
  {
    name: 'Wireless Gaming Mouse',
    sku: 'ELEC-MS-201',
    category: 'Electronics',
    price: 1899,
    quantity: 45,
    reorderLevel: 15,
    supplier: 'Razer India',
  },
  {
    name: 'Mechanical RGB Keyboard',
    sku: 'ELEC-KB-202',
    category: 'Electronics',
    price: 4299,
    quantity: 7,
    reorderLevel: 10,
    supplier: 'Keychron',
  },
  {
    name: 'Noise Cancelling Headphones',
    sku: 'ELEC-HP-203',
    category: 'Electronics',
    price: 9999,
    quantity: 20,
    reorderLevel: 5,
    supplier: 'Sony Electronics',
  },
  {
    name: 'USB-C 7-in-1 Aluminum Hub',
    sku: 'ACCS-HB-301',
    category: 'Accessories',
    price: 2199,
    quantity: 32,
    reorderLevel: 12,
    supplier: 'Anker Innovations',
  },
  {
    name: 'Laptop Cooling Pad with Fans',
    sku: 'ACCS-CP-302',
    category: 'Accessories',
    price: 1299,
    quantity: 4,
    reorderLevel: 8,
    supplier: 'DeepCool',
  },
  {
    name: 'Hardcover Dot Grid Journal',
    sku: 'SUPP-JN-401',
    category: 'Office Supplies',
    price: 350,
    quantity: 55,
    reorderLevel: 20,
    supplier: 'Factor Notes',
  },
  {
    name: 'Fineliner Drawing Pens 12-Pack',
    sku: 'SUPP-PN-402',
    category: 'Office Supplies',
    price: 420,
    quantity: 2,
    reorderLevel: 10,
    supplier: 'Staedtler',
  },
  {
    name: 'Stainless Steel Water Bottle 1L',
    sku: 'FITN-BT-501',
    category: 'Sports & Fitness',
    price: 799,
    quantity: 35,
    reorderLevel: 10,
    supplier: 'Milton',
  },
  {
    name: 'Adjustable Dumbbells Set 20kg',
    sku: 'FITN-DB-502',
    category: 'Sports & Fitness',
    price: 3499,
    quantity: 8,
    reorderLevel: 8,
    supplier: 'Kore Fitness',
  },
  {
    name: 'Anti-Skid Yoga Mat 6mm',
    sku: 'FITN-YM-503',
    category: 'Sports & Fitness',
    price: 899,
    quantity: 24,
    reorderLevel: 10,
    supplier: 'Boldfit',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env');
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing products...');
    await Product.deleteMany({});

    console.log('[Seed] Inserting sample products...');
    const created = await Product.insertMany(sampleProducts);

    console.log(`[Seed] Success! Added ${created.length} products to database.`);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
  }
};

seedDatabase();
