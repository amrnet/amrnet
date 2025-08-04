import dotenv from 'dotenv';
import pkg from 'mongodb';
const { MongoClient } = pkg;

dotenv.config();

/**
 * Generate MongoDB URI and client options for Heroku deployment
 * MongoDB Atlas works well with Heroku without requiring Fixie proxy
 * @returns {object} MongoDB configuration
 */
const getMongoConfig = () => {
  let mongoUri = process.env.MONGODB_URI;

  // Basic MongoDB options optimized for Atlas and Heroku
  const options = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    w: 'majority',
    // Use IPv4 first as Heroku sometimes has IPv6 issues
    family: 4
  };

  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment detected - using optimized MongoDB Atlas settings');
    // Increase timeouts for production environment
    options.serverSelectionTimeoutMS = 60000;
    options.connectTimeoutMS = 60000;
    options.socketTimeoutMS = 60000;
  } else {
    console.log('Development environment - using standard MongoDB settings');
  }

  return { uri: mongoUri, options };
};

const { uri: URI, options: clientOptions } = getMongoConfig();
export const client = new MongoClient(URI, clientOptions);

// Connection to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();

    // Test the connection with admin ping
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB Atlas');

    // Log connection info for debugging
    const admin = client.db('admin');
    const serverStatus = await admin.command({ serverStatus: 1 });
    console.log(`Connected to MongoDB ${serverStatus.version} on ${serverStatus.host}`);

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // Provide helpful debugging information
    if (process.env.NODE_ENV === 'production') {
      console.error('🔍 Production troubleshooting:');
      console.error('  1. Check MongoDB Atlas network access (0.0.0.0/0 should be allowed for Heroku)');
      console.error('  2. Verify database user permissions');
      console.error('  3. Check if MONGODB_URI environment variable is set correctly');
    }

    // In production, don't exit - let the app handle gracefully
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    } else {
      // In production, we'll try to reconnect on the next request
      throw error;
    }
  }
};

export { getMongoConfig };
export default connectDB;
