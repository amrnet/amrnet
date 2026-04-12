import express from 'express';
import connectDB from '../../config/db.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// Valid API tokens (in production, store in a database)
// ─────────────────────────────────────────────────────────────
// Token cache to avoid DB lookup on every request
const tokenCache = new Map();

async function authenticateToken(req, res, next) {
  const token = req.headers['x-api-key'] || req.query.api_key;
  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Provide an API key via X-API-Key header or api_key query parameter. Register at /api-register',
      docs: '/api-docs',
      register: '/api-register',
    });
  }

  // Check cache first
  if (tokenCache.has(token)) return next();

  // Validate against MongoDB
  try {
    const client = await connectDB();
    const record = await client.db('amrnet_admin').collection('api_keys').findOne({ api_key: token, active: true });
    if (!record) {
      return res.status(403).json({ error: 'Invalid or deactivated API key. Register at /api-register' });
    }
    tokenCache.set(token, true);
    next();
  } catch (error) {
    console.error('[Auth] DB error:', error.message);
    return res.status(500).json({ error: 'Authentication service unavailable' });
  }
}

// Apply auth to all routes in this router
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────
// DB config
// ─────────────────────────────────────────────────────────────
const DB_MAP = {
  styphi: { db: 'styphi', collection: 'amrnetdb_styphi' },
  kpneumo: { db: 'kpneumo', collection: 'amrnetdb_kpneumo' },
  ngono: { db: 'ngono', collection: 'amrnetdb_ngono' },
  ecoli: { db: 'ecoli', collection: 'amrnetdb_ecoli' },
  decoli: { db: 'decoli', collection: 'amrnetdb_decoli' },
  shige: { db: 'shige', collection: 'amrnetdb_shige' },
  senterica: { db: 'senterica', collection: 'amrnetdb_senterica' },
  sentericaints: { db: 'sentericaints', collection: 'amrnetdb_ints' },
  saureus: { db: 'saureus', collection: 'amrnetdb_saureus' },
  strepneumo: { db: 'strepneumo', collection: 'amrnetdb_spneumo' },
};

const ORGANISMS = Object.keys(DB_MAP);

// ─────────────────────────────────────────────────────────────
// GET /v1/organisms — List all available organisms
// ─────────────────────────────────────────────────────────────
router.get('/organisms', async (_req, res) => {
  try {
    const client = await connectDB();
    const counts = {};
    for (const [org, { db, collection }] of Object.entries(DB_MAP)) {
      try {
        counts[org] = await client.db(db).collection(collection).estimatedDocumentCount();
      } catch {
        counts[org] = 0;
      }
    }
    res.json({
      organisms: ORGANISMS.map(org => ({
        id: org,
        genomes: counts[org],
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /v1/organisms/:organism/resistance — Resistance summary
// ─────────────────────────────────────────────────────────────
router.get('/organisms/:organism/resistance', async (req, res) => {
  const { organism } = req.params;
  const { country, year_from, year_to, limit: qLimit } = req.query;

  if (!DB_MAP[organism]) {
    return res.status(404).json({ error: `Unknown organism: ${organism}`, available: ORGANISMS });
  }

  const { db, collection } = DB_MAP[organism];
  const match = { 'dashboard view': { $regex: /^include$/i } };

  if (country) match.COUNTRY_ONLY = { $regex: new RegExp(`^${country}$`, 'i') };
  if (year_from || year_to) {
    match.$expr = { $and: [] };
    if (year_from) match.$expr.$and.push({ $gte: [{ $toInt: { $ifNull: ['$DATE', '0'] } }, parseInt(year_from)] });
    if (year_to) match.$expr.$and.push({ $lte: [{ $toInt: { $ifNull: ['$DATE', '0'] } }, parseInt(year_to)] });
    if (match.$expr.$and.length === 1) match.$expr = match.$expr.$and[0];
  }

  try {
    const client = await connectDB();
    const col = client.db(db).collection(collection);

    // Detect drug columns dynamically from the first document
    const sample = await col.findOne(match);
    if (!sample) return res.json({ organism, total: 0, resistance: {} });

    const drugColumns = [
      'Aminoglycoside', 'Beta-lactam', 'Sulfonamide', 'Tetracycline',
      'Phenicol', 'Quinolone', 'Fosfomycin', 'Trimethoprim',
      'Macrolide', 'Lincosamide', 'Streptothricin', 'Rifamycin',
      'Colistin', 'Bleomycin',
      // styphi / ngono / kpneumo may have different columns
      'azith_pred_pheno', 'cip_pred_pheno', 'ESBL_category',
      'Azithromycin', 'Ciprofloxacin', 'Spectinomycin',
    ].filter(col => col in sample);

    const total = await col.countDocuments(match);
    const limit = Math.min(parseInt(qLimit) || 50000, 100000);

    const docs = await col.find(match).limit(limit).toArray();

    // Count resistance per drug
    const resistance = {};
    drugColumns.forEach(drug => {
      const count = docs.filter(d => {
        const v = d[drug];
        return v != null && v !== '' && v !== '-' && v !== '0';
      }).length;
      resistance[drug] = {
        resistant: count,
        total: docs.length,
        percentage: Number(((count / docs.length) * 100).toFixed(2)),
      };
    });

    res.json({
      organism,
      total,
      sampled: docs.length,
      filters: { country: country || 'all', year_from: year_from || 'all', year_to: year_to || 'all' },
      resistance,
    });
  } catch (error) {
    console.error('[Public API] resistance error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /v1/organisms/:organism/genomes — Raw genome data
// ─────────────────────────────────────────────────────────────
router.get('/organisms/:organism/genomes', async (req, res) => {
  const { organism } = req.params;
  const { country, year_from, year_to, genotype, page: qPage, limit: qLimit } = req.query;

  if (!DB_MAP[organism]) {
    return res.status(404).json({ error: `Unknown organism: ${organism}`, available: ORGANISMS });
  }

  const { db, collection } = DB_MAP[organism];
  const match = { 'dashboard view': { $regex: /^include$/i } };

  if (country) match.COUNTRY_ONLY = { $regex: new RegExp(`^${country}$`, 'i') };
  if (genotype) match.GENOTYPE = { $regex: new RegExp(genotype, 'i') };
  if (year_from || year_to) {
    match.$expr = { $and: [] };
    if (year_from) match.$expr.$and.push({ $gte: [{ $toInt: { $ifNull: ['$DATE', '0'] } }, parseInt(year_from)] });
    if (year_to) match.$expr.$and.push({ $lte: [{ $toInt: { $ifNull: ['$DATE', '0'] } }, parseInt(year_to)] });
    if (match.$expr.$and.length === 1) match.$expr = match.$expr.$and[0];
  }

  const page = Math.max(parseInt(qPage) || 1, 1);
  const limit = Math.min(parseInt(qLimit) || 100, 1000);
  const skip = (page - 1) * limit;

  try {
    const client = await connectDB();
    const col = client.db(db).collection(collection);
    const [total, data] = await Promise.all([
      col.countDocuments(match),
      col.find(match).project({ _id: 0, 'dashboard view': 0 }).skip(skip).limit(limit).toArray(),
    ]);

    res.json({
      organism,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data,
    });
  } catch (error) {
    console.error('[Public API] genomes error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /v1/organisms/:organism/countries — Per-country summary
// ─────────────────────────────────────────────────────────────
router.get('/organisms/:organism/countries', async (req, res) => {
  const { organism } = req.params;
  const { year_from, year_to } = req.query;

  if (!DB_MAP[organism]) {
    return res.status(404).json({ error: `Unknown organism: ${organism}`, available: ORGANISMS });
  }

  const { db, collection } = DB_MAP[organism];
  const match = { 'dashboard view': { $regex: /^include$/i } };

  if (year_from || year_to) {
    match.$expr = { $and: [] };
    if (year_from) match.$expr.$and.push({ $gte: [{ $toInt: { $ifNull: ['$DATE', '0'] } }, parseInt(year_from)] });
    if (year_to) match.$expr.$and.push({ $lte: [{ $toInt: { $ifNull: ['$DATE', '0'] } }, parseInt(year_to)] });
    if (match.$expr.$and.length === 1) match.$expr = match.$expr.$and[0];
  }

  try {
    const client = await connectDB();
    const col = client.db(db).collection(collection);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$COUNTRY_ONLY',
          count: { $sum: 1 },
          years: { $addToSet: '$DATE' },
        },
      },
      { $sort: { count: -1 } },
    ];

    const results = await col.aggregate(pipeline).toArray();

    res.json({
      organism,
      total_countries: results.length,
      countries: results.map(r => ({
        country: r._id,
        genomes: r.count,
        year_range: r.years.filter(Boolean).sort(),
      })),
    });
  } catch (error) {
    console.error('[Public API] countries error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /v1/organisms/:organism/download — Download full dataset
// ─────────────────────────────────────────────────────────────
router.get('/organisms/:organism/download', async (req, res) => {
  const { organism } = req.params;
  const { format } = req.query;

  if (!DB_MAP[organism]) {
    return res.status(404).json({ error: `Unknown organism: ${organism}`, available: ORGANISMS });
  }

  const { db, collection } = DB_MAP[organism];
  const match = { 'dashboard view': { $regex: /^include$/i } };

  try {
    const client = await connectDB();
    const col = client.db(db).collection(collection);
    const data = await col.find(match).project({ _id: 0, 'dashboard view': 0 }).toArray();

    if (format === 'csv') {
      if (data.length === 0) return res.status(204).send();
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
          const val = row[h] ?? '';
          return String(val).includes(',') ? `"${val}"` : val;
        }).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=amrnet_${organism}.csv`);
      return res.send(csv);
    }

    res.setHeader('Content-Disposition', `attachment; filename=amrnet_${organism}.json`);
    res.json({ organism, total: data.length, data });
  } catch (error) {
    console.error('[Public API] download error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
