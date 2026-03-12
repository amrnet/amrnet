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
    family: 4,
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

// Global client instance for shared use
let globalClient = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Connection to MongoDB
const connectDB = async () => {
  if (!globalClient) {
    globalClient = new MongoClient(URI, clientOptions);

    for (let attempt = 1; attempt <= MAX_CONNECTION_ATTEMPTS; attempt++) {
      try {
        console.log(`DB config: Connection attempt ${attempt}/${MAX_CONNECTION_ATTEMPTS}`);
        await globalClient.connect();

        // Test connection
        await globalClient.db('ecoli2').command({ ping: 1 });

        console.log('✅ DB config: MongoDB connection established');
        connectionAttempts = 0; // Reset on success
        break;
      } catch (error) {
        console.error(`❌ DB config: Connection attempt ${attempt} failed:`, error.message);

        if (attempt === MAX_CONNECTION_ATTEMPTS) {
          console.error('🚨 DB config: Max connection attempts reached');
          globalClient = null; // Reset client for next request
          throw new Error(`MongoDB connection failed after ${MAX_CONNECTION_ATTEMPTS} attempts: ${error.message}`);
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return globalClient;
};

// Helper function to validate and clamp timeout values
// Ensures timeout is a positive integer, falls back to default if invalid
const getValidatedTimeoutMs = (envValue, defaultMs = 60000) => {
  if (!envValue) return defaultMs;

  const parsed = Number.parseInt(envValue, 10);

  // Check if parsing failed or value is non-positive
  if (Number.isNaN(parsed) || parsed <= 0) {
    console.warn(`⚠️ Invalid AGGREGATION_TIMEOUT_MS value "${envValue}" (must be > 0). Using default ${defaultMs}ms`);
    return defaultMs;
  }

  // Optionally warn if value seems unreasonably high (> 5 minutes)
  if (parsed > 300000) {
    console.warn(
      `⚠️ AGGREGATION_TIMEOUT_MS is very high (${parsed}ms). Consider reducing to avoid long-running queries.`,
    );
  }

  return parsed;
};

// Helper function to get data with timeout protection
const getDataWithTimeout = async (dbName, collectionName, query) => {
  try {
    // Ensure client is connected
    const connectedClient = await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 10000)),
    ]);

    // Execute query with timeout
    const result = await Promise.race([
      connectedClient.db(dbName).collection(collectionName).find(query).toArray(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 100000)),
    ]);

    return result;
  } catch (error) {
    console.error(`Error retrieving data from ${collectionName}:`, error.message);
    throw error;
  }
};

// Helper function for aggregation with timeout protection
const getAggregatedDataWithTimeout = async (dbName, collectionName, pipeline) => {
  try {
    // Ensure client is connected
    const connectedClient = await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 10000)),
    ]);

    // Execute aggregation with timeout
    const aggregationTimeoutMs = Number.parseInt(process.env.AGGREGATION_TIMEOUT_MS ?? '60000', 10);

    const result = await Promise.race([
      connectedClient.db(dbName).collection(collectionName).aggregate(pipeline).toArray(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Aggregation timeout')),
          Number.isNaN(aggregationTimeoutMs) ? 60000 : aggregationTimeoutMs,
        ),
      ),
    ]);

    return result;
  } catch (error) {
    console.error(`Error running aggregation on ${collectionName}:`, error.message);
    throw error;
  }
};

// Helper function for counting documents with timeout protection
const getCollectionCountWithTimeout = async (dbName, collectionName, query) => {
  try {
    // Ensure client is connected
    const connectedClient = await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 10000)),
    ]);

    // Execute count with timeout
    const count = await Promise.race([
      connectedClient.db(dbName).collection(collectionName).countDocuments(query),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Count timeout')), 15000)),
    ]);

    return count;
  } catch (error) {
    console.error(`Error counting documents in ${collectionName}:`, error.message);
    throw error;
  }
};

// Helper function to get connected client with timeout protection
const getConnectedClient = async () => {
  try {
    return await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 10000)),
    ]);
  } catch (error) {
    console.error('Error getting connected client:', error.message);
    throw error;
  }
};

// Initialize client on module load with timeout handling
connectDB().catch(error => {
  console.warn('DB config: MongoDB connection failed:', error.message);
  console.log('DB config will attempt to reconnect on first request');
});

export {
  getAggregatedDataWithTimeout,
  getCollectionCountWithTimeout,
  getConnectedClient,
  getDataWithTimeout,
  getMongoConfig,
};
export default connectDB;
