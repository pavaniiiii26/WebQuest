import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MONGODB_URI is not set in environment variables. Database features will be inactive.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Don't crash the server if connection fails intermittently; log clear details
    return null;
  }
}

export default connectDB;
