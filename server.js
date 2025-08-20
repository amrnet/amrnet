import generateFile from './routes/api/generateDataAPIsFile.js';
import generateFileClean from './routes/api/generateDataClean.js';
import api from './routes/api/api.js';
import optimized from './routes/api/optimized.js';
import combine_files from './routes/api/combine_files.js';
import mongo_controller from './controllers/controller_DB.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRouter from './routes/api/email.js';
import path, { dirname } from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import compression from 'compression';
import performanceMonitor from './middleware/performanceMonitor.js';

// REMOVED: import bodyParser from 'body-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dotenv config
dotenv.config();

// Connect database
connectDB();

const app = express();
// Use compression middleware to compress responses
app.use(compression({
  // Only compress responses that are larger than this threshold
  threshold: 1024, // 1KB
  // Compression level (0-9, where 9 is best compression but slowest)
  level: 6,
  // Only compress certain content types
  filter: (req, res) => {
    // Don't compress if the request includes a cache-control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Fallback to standard filter function
    return compression.filter(req, res);
  }
}));
// REMOVED: app.use(bodyParser.json({ limit: '400mb' }));

// Middleware
app.use(performanceMonitor); // Add performance monitoring first
app.use(cors());
app.use(express.json({ limit: '400mb' })); // ADDED: limit option
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Define headers used for API requisitions
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Token, Authorization',
  );
  next();
});

// Define routes API here
app.use('/api', api);
app.use('/api/optimized', optimized);
app.use('/api/email', emailRouter);
app.use('/api/file', generateFile);
app.use('/api/data', generateFileClean);
app.use('/api/combine', combine_files);
app.use('/api/mongo', mongo_controller);
app.use(express.static(path.join(__dirname, './client', 'build')));

// If no API routes are hit, send the React app
app.use('/', function (req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the API server and log a message when it's ready
const server = app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
});
