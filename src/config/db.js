const mongoose = require('mongoose');

// Connect to MongoDB database
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('ERROR: MONGO_URI environment variable is missing in .env file.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
