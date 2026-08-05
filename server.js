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

// NOTE: The /api/glass-phenotypic proxy (which scraped a third-party compiled
// CSV of the WHO GLASS 2022 report from the qleclerc/GLASS2022 GitHub repo) was
// removed on data-governance grounds: the provenance/status of PDF-scraped data
// is unclear, and GLASS data must be obtained directly from WHO and used under
// the WHO data terms (https://www.who.int/about/policies/publishing/data-policy/terms-and-conditions).
// GLASS AMU/AMR is now sourced only from the WHO GHO OData API via /api/gho/:indicator.

// GLASS data from MongoDB (populated by scripts/check-glass-data.js)
app.get('/api/glass-mongodb', async (req, res) => {
  try {
    const client = await connectDB();
    const col = client.db('amrnet_admin').collection('glass_data');
    const count = await col.estimatedDocumentCount();
    if (count === 0) {
      // Not populated yet — return 200 with an empty payload (not 404) so the
      // client cleanly falls through to the live GHO proxy without logging a
      // console error. Populate with: node scripts/check-glass-data.js
      return res.json({
        consumption: [],
        resistance: { ecoli_3gc: [], mrsa: [], ng_ciprofloxacin: [], ng_azithromycin: [], ng_ceftriaxone: [], ng_cefixime: [] },
        phenotypic: [],
        source: 'none',
      });
    }

    const ghoRecords = await col.find({ source: 'GHO_API' }).toArray();
    const csvRecords = await col.find({ source: 'GLASS_CSV' }).toArray();

    // Build the same structure as fetchGLASSData()
    const consumption = ghoRecords.filter(r => r.indicator === 'GLASSAMC_TC');
    const resistance = {
      ecoli_3gc: ghoRecords.filter(r => r.indicator === 'AMR_INFECT_ECOLI'),
      mrsa: ghoRecords.filter(r => r.indicator === 'AMR_INFECT_MRSA'),
      ng_ciprofloxacin: ghoRecords.filter(r => r.indicator === 'GASPRSCIP'),
      ng_azithromycin: ghoRecords.filter(r => r.indicator === 'GASPRSAZM'),
      ng_ceftriaxone: ghoRecords.filter(r => r.indicator === 'GASPRSCRO'),
      ng_cefixime: ghoRecords.filter(r => r.indicator === 'GASPRSCFM'),
    };

    res.json({ consumption, resistance, phenotypic: csvRecords, source: 'mongodb' });
  } catch (error) {
    console.error('[GLASS MongoDB]', error.message);
    res.status(500).json({ error: 'Failed to read GLASS data from MongoDB' });
  }
});

// GHO OData API proxy (avoids CORS issues with WHO API).
//
// The WHO GHO OData endpoint (ghoapi.azureedge.net) is the documented source
// and still active, but WHO has signalled a migration to a new OData
// implementation and the endpoint occasionally returns transient 5xx. To keep
// the dashboard resilient we (a) cache successful responses in memory for a day
// and (b) retry once with a timeout before giving up. The durable fix is to
// pre-load the data into MongoDB (scripts/check-glass-data.js) so this live
// proxy is only a fallback. See also the new WHO GLASS dashboard, which offers
// the underlying AMR/AMU data for direct download.
const GHO_CACHE = new Map(); // indicator -> { ts, data }
const GHO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchGhoIndicator(indicator, { timeoutMs = 15000, retries = 1 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`https://ghoapi.azureedge.net/api/${indicator}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`GHO API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      if (attempt === retries) throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

app.get('/api/gho/:indicator', async (req, res) => {
  const indicator = req.params.indicator;
  // Whitelist allowed indicators to prevent abuse
  const allowed = ['GLASSAMC_TC', 'GLASSAMC_AWARE', 'AMR_INFECT_ECOLI', 'AMR_INFECT_MRSA', 'GASPRSCIP', 'GASPRSAZM', 'GASPRSCRO', 'GASPRSCFM', 'GASPRSESC'];
  if (!allowed.includes(indicator)) {
    return res.status(400).json({ error: 'Invalid indicator' });
  }

  const cached = GHO_CACHE.get(indicator);
  if (cached && Date.now() - cached.ts < GHO_CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const data = await fetchGhoIndicator(indicator);
    GHO_CACHE.set(indicator, { ts: Date.now(), data });
    res.json(data);
  } catch (error) {
    console.error('[GHO Proxy]', indicator, error.message);
    // Serve stale cache if we have it, rather than failing the widget.
    if (cached) {
      return res.json(cached.data);
    }
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
