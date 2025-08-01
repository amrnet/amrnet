import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();
let URI = process.env.MONGODB_URI;
export const client = new MongoClient(URI);

// Connection to MongoDB
const connectDB = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
