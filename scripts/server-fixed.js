import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pkg from 'mongodb';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongo_controller from '../controllers/controller_DB.js';
import performanceMonitor from '../middleware/performanceMonitor.js';
import api from '../routes/api/api.js';
import combine_files from '../routes/api/combine_files.js';
import emailRouter from '../routes/api/email.js';
import generateFile from '../routes/api/generateDataAPIsFile.js';
import generateFileClean from '../routes/api/generateDataClean.js';
import optimized from '../routes/api/optimized.js';

const { MongoClient } = pkg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Dotenv config
dotenv.config();

const app = express();

// MongoDB connection with better error handling
let dbConnected = false;
let client;

const connectDBWithRetry = async () => {
  try {
    const URI = process.env.MONGODB_URI;
    console.log('Attempting to connect to MongoDB...');

    client = new MongoClient(URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    });

    await client.connect();
    console.log('✅ MongoDB connected successfully');
    dbConnected = true;
    return client;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed: ${error.message}`);
    console.log('Server will continue with limited functionality');
    dbConnected = false;
    return null;
  }
};

// Try to connect to MongoDB but don't block server startup
connectDBWithRetry();

// Use compression middleware to compress responses
app.use(compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Middleware
app.use(performanceMonitor);
app.use(cors());
app.use(express.json({ limit: '400mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: dbConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Modified collection counts endpoint with fallback
app.get('/api/getCollectionCounts', async (req, res) => {
  try {
    if (!dbConnected || !client) {
      // Return mock data if database is not connected
      console.log('Database not connected, returning mock data');
      return res.json({
        styphi: "Loading...",
        kpneumo: "Loading...",
        ngono: "Loading...",
        ecoli: "Loading...",
        decoli: "Loading...",
        shige: "Loading...",
        senterica: "Loading...",
        sentericaints: "Loading..."
      });
    }

    // Real database query
    const dbAndCollectionNames = {
      styphi: { dbName: 'styphi', collectionName: 'amrnetdb_styphi' },
      kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
      ngono: { dbName: 'ngono', collectionName: 'amrnetdb_ngono' },
      ecoli: { dbName: 'ecoli', collectionName: 'amrnetdb_ecoli' },
      decoli: { dbName: 'decoli', collectionName: 'amrnetdb_decoli' },
      shige: { dbName: 'shige', collectionName: 'amrnetdb_shige' },
      senterica: { dbName: 'senterica', collectionName: 'sentericatest' },
      sentericaints: { dbName: 'sentericaints', collectionName: 'merge_rawdata_sients' },
    };

    const countPromises = Object.entries(dbAndCollectionNames).map(([key, { dbName, collectionName }]) => {
      return client
        .db(dbName)
        .collection(collectionName)
        .countDocuments({
          'dashboard view': { $regex: /^include$/, $options: 'i' },
          $or: [{ GENOTYPE: { $ne: null } }, { ST: { $ne: null } }, { MLST_Achtman: { $ne: null } }],
        });
    });

    const counts = await Promise.all(countPromises);

    const result = Object.keys(dbAndCollectionNames).reduce((acc, key, index) => {
      acc[key] = counts[index].toLocaleString('fi-FI');
      return acc;
    }, {});

    return res.json(result);
  } catch (error) {
    console.error('Error in getCollectionCounts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Routes
app.use('/api', api);
app.use('/api/optimized', optimized);
app.use('/api/email', emailRouter);
app.use('/api/data', generateFile);
app.use('/api/data', generateFileClean);
app.use('/api/combine', combine_files);
app.use('/api/mongo', mongo_controller);
app.use(express.static(path.join(__dirname, './client', 'build')));

// If no API routes are hit, send the React app
app.use('/', function (req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 8080;

// Start the API server and log a message when it's ready
const server = app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  console.log(`📊 Database status: ${dbConnected ? 'Connected' : 'Disconnected (using fallback data)'}`);
});

export default app;
