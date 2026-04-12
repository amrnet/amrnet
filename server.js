import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import mongo_controller from './controllers/controller_DB.js';
import performanceMonitor from './middleware/performanceMonitor.js';
import aggregations from './routes/api/aggregations.js';
import api from './routes/api/api.js';
import combine_files from './routes/api/combine_files.js';
import generateFile from './routes/api/generateDataAPIsFile.js';
import generateFileClean from './routes/api/generateDataClean.js';
import optimized from './routes/api/optimized.js';
import apiRegistration from './routes/api/apiRegistration.js';
import publicApi from './routes/api/publicApi.js';
import swaggerDocs from './routes/api/swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dotenv config
dotenv.config();

// Connect database
connectDB();

const app = express();
// Use compression middleware to compress responses
app.use(
  compression({
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
    },
  }),
);
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
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Token, Authorization');
  next();
});

// Normalize GLASS country names to match AMRnet's getCountryDisplayName format
function normalizeGLASSCountry(name) {
  if (!name) return '';
  const map = {
    'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
    'United States of America': 'United States of America',
    'Iran (Islamic Republic of)': 'Iran',
    'Republic of Korea': 'South Korea',
    'Republic of Moldova': 'Moldova',
    'Russian Federation': 'Russia',
    'Viet Nam': 'Vietnam',
    'Lao People\'s Democratic Republic': 'Laos',
    'Syrian Arab Republic': 'Syria',
    'United Republic of Tanzania': 'Tanzania',
    'Türkiye': 'Turkey',
    'Czechia': 'Czechia',
    'Czech Republic': 'Czechia',
    'Bolivia (Plurinational State of)': 'Bolivia',
    'Venezuela (Bolivarian Republic of)': 'Venezuela',
    'Democratic People\'s Republic of Korea': 'North Korea',
    'Democratic Republic of the Congo': 'Dem. Rep. Congo',
    'State of Palestine': 'Palestine',
    'Congo': 'Congo',
    'Eswatini': 'Eswatini',
    'Côte d\'Ivoire': "Côte d'Ivoire",
    'The Netherlands': 'Netherlands',
    'The Gambia': 'Gambia',
    'Dominican Republic': 'Dominican Rep.',
    'Central African Republic': 'Central African Rep.',
    'Brunei Darussalam': 'Brunei',
    'Republic of North Macedonia': 'North Macedonia',
    'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
    'United Arab Emirates': 'United Arab Emirates',
    'Saudi Arabia': 'Saudi Arabia',
  };
  return map[name] || name.trim();
}

// GLASS compiled phenotypic data proxy (from qleclerc/GLASS2022 GitHub repo)
let glassCSVCache = null;
let glassCSVCacheTime = 0;
const GLASS_CSV_CACHE_MS = 24 * 60 * 60 * 1000; // 24 hours

app.get('/api/glass-phenotypic', async (req, res) => {
  try {
    const now = Date.now();
    if (glassCSVCache && (now - glassCSVCacheTime) < GLASS_CSV_CACHE_MS) {
      return res.json(glassCSVCache);
    }
    const csvUrl = 'https://raw.githubusercontent.com/qleclerc/GLASS2022/master/compiled_WHO_GLASS_2022.csv';
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const text = await response.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      if (values.length < headers.length) continue;
      const row = {};
      headers.forEach((h, j) => { row[h] = values[j]; });
      // Include relevant specimen types for different organisms
      if (['BLOOD', 'STOOL', 'URINE', 'GENITAL'].includes(row.Specimen)) {
        data.push({
          country: normalizeGLASSCountry(row.CountryTerritoryArea),
          iso3: row.Iso3,
          region: row.WHORegionName,
          year: parseInt(row.Year),
          specimen: row.Specimen,
          pathogen: row.PathogenName,
          antibiotic: row.AbTargets,
          tested: parseInt(row.InterpretableAST) || 0,
          resistant: parseInt(row.Resistant) || 0,
          percentResistant: parseFloat(row.PercentResistant) || 0,
        });
      }
    }
    glassCSVCache = data;
    glassCSVCacheTime = now;
    console.log(`[GLASS Phenotypic] Parsed ${data.length} records from GLASS CSV`);
    res.json(data);
  } catch (error) {
    console.error('[GLASS Phenotypic]', error.message);
    res.status(502).json({ error: 'Failed to fetch GLASS phenotypic data' });
  }
});

// GHO OData API proxy (avoids CORS issues with WHO API)
app.get('/api/gho/:indicator', async (req, res) => {
  try {
    const indicator = req.params.indicator;
    // Whitelist allowed indicators to prevent abuse
    const allowed = ['GLASSAMC_TC', 'GLASSAMC_AWARE', 'AMR_INFECT_ECOLI', 'AMR_INFECT_MRSA', 'GASPRSCIP', 'GASPRSAZM', 'GASPRSCRO', 'GASPRSCFM', 'GASPRSESC'];
    if (!allowed.includes(indicator)) {
      return res.status(400).json({ error: 'Invalid indicator' });
    }
    const response = await fetch(`https://ghoapi.azureedge.net/api/${indicator}`);
    if (!response.ok) throw new Error(`GHO API returned ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[GHO Proxy]', error.message);
    res.status(502).json({ error: 'Failed to fetch from WHO GHO API' });
  }
});

// Public API with Swagger docs and self-service registration
app.use('/api-register', apiRegistration);
app.use('/api-docs', swaggerDocs);
app.use('/api/v1', publicApi);

// Define routes API here
app.use('/api', aggregations);
app.use('/api', api);
app.use('/api/optimized', optimized);
app.use('/api/file', generateFile);
app.use('/api/data', generateFileClean);
app.use('/api/combine', combine_files);
app.use('/api/mongo', mongo_controller);
app.use(express.static(path.join(__dirname, './client', 'build')));

// If no API routes are hit, send the React app (but not for /api-docs or /api/v1)
app.use('/', function (req, res, next) {
  if (req.path.startsWith('/api-docs') || req.path.startsWith('/api/v1') || req.path.startsWith('/api-register')) {
    return next();
  }
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the API server and log a message when it's ready
const server = app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
});
