import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate MongoDB client options with Fixie proxy support
 * @returns {object} MongoDB client options
 */
const getMongoClientOptions = () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 5,
  };

  // Check if Fixie SOCKS5 proxy is available (for Heroku)
  if (process.env.FIXIE_URL) {
    try {
      const fixieUrl = new URL(process.env.FIXIE_URL);

      console.log('Configuring MongoDB connection with Fixie SOCKS5 proxy...');

      options.proxyHost = fixieUrl.hostname;
      options.proxyPort = parseInt(fixieUrl.port, 10);
      options.proxyUsername = fixieUrl.username;
      options.proxyPassword = fixieUrl.password;

      console.log(`Proxy configured: ${fixieUrl.hostname}:${fixieUrl.port}`);
    } catch (error) {
      console.warn('Failed to parse FIXIE_URL, proceeding without proxy:', error.message);
    }
  } else {
    console.log('No Fixie proxy detected, using direct MongoDB connection');
  }

  return options;
};

let URI = process.env.MONGODB_URI;
const clientOptions = getMongoClientOptions();
export const client = new MongoClient(URI, clientOptions);

// Connection to MongoDB
const connectDB = async () => {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    if (process.env.FIXIE_URL) {
      console.log('MongoDB connection established via Fixie SOCKS5 proxy');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export { getMongoClientOptions };
export default connectDB;
