import express from 'express';
import { MongoClient } from 'mongodb';
import { performance } from 'perf_hooks';
import { getMongoConfig } from '../../config/db.js';

const router = express.Router();

// MongoDB client setup for production deployment
let client;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

const connectDB = async () => {
  if (!client) {
    const { uri, options } = getMongoConfig();
    client = new MongoClient(uri, options);

    for (let attempt = 1; attempt <= MAX_CONNECTION_ATTEMPTS; attempt++) {
      try {
        console.log(`Optimized routes: Connection attempt ${attempt}/${MAX_CONNECTION_ATTEMPTS}`);
        await client.connect();

        // Test connection
        await client.db('ecoli2').command({ ping: 1 });
        console.log('✅ Optimized routes: MongoDB connection established');
        connectionAttempts = 0; // Reset on success
        break;
      } catch (error) {
        console.error(`❌ Optimized routes: Connection attempt ${attempt} failed:`, error.message);

        if (attempt === MAX_CONNECTION_ATTEMPTS) {
          console.error('🚨 Optimized routes: Max connection attempts reached');
          client = null; // Reset client for next request
          throw new Error(`MongoDB connection failed after ${MAX_CONNECTION_ATTEMPTS} attempts: ${error.message}`);
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return client;
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
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 15000)),
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
    const result = await Promise.race([
      connectedClient.db(dbName).collection(collectionName).aggregate(pipeline).toArray(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Aggregation timeout')), 15000)),
    ]);

    return result;
  } catch (error) {
    console.error(`Error running aggregation on ${collectionName}:`, error.message);
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
  console.warn('Optimized routes: MongoDB connection failed:', error.message);
  console.log('Optimized routes will attempt to reconnect on first request');
});

const dbAndCollectionNames = {
  styphi: { dbName: 'styphi', collectionName: 'amrnetdb_styphi' },
  kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
  ngono: { dbName: 'ngono', collectionName: 'amrnetdb_ngono' },
  ecoli: { dbName: 'ecoli', collectionName: 'amrnetdb_ecoli' },
  decoli: { dbName: 'decoli', collectionName: 'amrnetdb_decoli' },
  shige: { dbName: 'shige', collectionName: 'amrnetdb_shige' },
  senterica: { dbName: 'senterica', collectionName: 'merge_rawdata_se' },
  sentericaints: { dbName: 'sentericaints', collectionName: 'merge_rawdata_sients' },
  unr: { dbName: 'unr', collectionName: 'unr' },
};

// Essential fields for map data
const mapFields = {
  styphi: {
    COUNTRY_ONLY: 1,
    DATE: 1,
    GENOTYPE: 1,
    TRAVEL: 1,
    'H58/NonH58': 1,
    cip_pheno: 1,
    azithromycin_category: 1,
    MDR: 1,
    XDR: 1,
    _id: 0,
  },
  kpneumo: {
    COUNTRY_ONLY: 1,
    DATE: 1,
    GENOTYPE: 1,
    LATITUDE: 1,
    LONGITUDE: 1,
    ESBL_category: 1,
    Carbapenems_category: 1,
    cgST: 1,
    Sublineage: 1,
    AGly_acquired: 1,
    Bla_Carb_acquired: 1,
    Bla_ESBL_acquired: 1,
    Bla_ESBL_inhR_acquired: 1,
    Flq_acquired: 1,
    Flq_mutations: 1,
    Col_acquired: 1,
    Col_mutations: 1,
    Fcyn_acquired: 1,
    Phe_acquired: 1,
    Sul_acquired: 1,
    Tet_acquired: 1,
    Tgc_acquired: 1,
    Tmt_acquired: 1,
    SHV_mutations: 1,
    Omp_mutations: 1,
    num_resistance_classes: 1,
    virulence_score: 1,
    O_locus: 1,
    K_locus: 1,
    O_type: 1,
    NAME: 1,
    _id: 0,
  },
  ecoli: {
    COUNTRY_ONLY: 1,
    DATE: 1,
    GENOTYPE: 1,
    Pathovar: 1,
    Serotype: 1,
    Aminoglycoside: 1,
    Carbapenemase: 1,
    ESBL: 1,
    Quinolone: 1,
    Colistin: 1,
    Fosfomycin: 1,
    Penicllin: 1,
    Phenicol: 1,
    Sulfonamide: 1,
    Tetracycline: 1,
    Trimethoprim: 1,
    'O Antigen': 1,
    'H Antigen': 1,
    Uberstrain: 1,
    Name: 1,
    _id: 0,
  },
  decoli: {
    COUNTRY_ONLY: 1,
    DATE: 1,
    GENOTYPE: 1,
    Pathovar: 1,
    Serotype: 1,
    Aminoglycoside: 1,
    Carbapenemase: 1,
    ESBL: 1,
    Quinolone: 1,
    Colistin: 1,
    Fosfomycin: 1,
    Penicllin: 1,
    Phenicol: 1,
    Sulfonamide: 1,
    Tetracycline: 1,
    Trimethoprim: 1,
    'O Antigen': 1,
    'H Antigen': 1,
    Name: 1,
    _id: 0,
  },
  shige: {
    COUNTRY_ONLY: 1,
    DATE: 1,
    GENOTYPE: 1,
    LATITUDE: 1,
    LONGITUDE: 1,
    ESBL_category: 1,
    Fluoro_category: 1,
    Pathovar: 1,
    Serotype: 1,
    TRAVEL: 1,
    MDR: 1,
    XDR: 1,
    amr_category: 1,
    _id: 0,
  },
  // Add other organisms as needed
};

// Chart/section data fields
const chartFields = {
  styphi: {
    genotypes: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      TRAVEL: 1,
      _id: 0,
    },
    resistance: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      cip_pheno: 1,
      azithromycin_category: 1,
      MDR: 1,
      XDR: 1,
      'H58/NonH58': 1,
      _id: 0,
    },
    trends: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      cip_pheno: 1,
      azithromycin_category: 1,
      _id: 0,
    },
  },
  kpneumo: {
    genotypes: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      _id: 0,
    },
    resistance: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      ESBL_category: 1,
      Carbapenems_category: 1,
      _id: 0,
    },
    trends: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      ESBL_category: 1,
      Carbapenems_category: 1,
      _id: 0,
    },
  },
  ecoli: {
    genotypes: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      _id: 0,
    },
    resistance: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      ESBL_category: 1,
      Fluoro_category: 1,
      _id: 0,
    },
    trends: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      ESBL_category: 1,
      Fluoro_category: 1,
      _id: 0,
    },
  },
  decoli: {
    genotypes: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      Pathovar: 1,
      Serotype: 1,
      O_type: 1,
      H_type: 1,
      TRAVEL: 1,
      _id: 0,
    },
    resistance: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      ESBL_category: 1,
      Fluoro_category: 1,
      MDR: 1,
      XDR: 1,
      amr_category: 1,
      _id: 0,
    },
    trends: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      ESBL_category: 1,
      Fluoro_category: 1,
      Pathovar: 1,
      Serotype: 1,
      _id: 0,
    },
  },
  shige: {
    genotypes: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      Pathovar: 1,
      Serotype: 1,
      TRAVEL: 1,
      _id: 0,
    },
    resistance: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      ESBL_category: 1,
      Fluoro_category: 1,
      MDR: 1,
      XDR: 1,
      amr_category: 1,
      _id: 0,
    },
    trends: {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      ESBL_category: 1,
      Fluoro_category: 1,
      Pathovar: 1,
      Serotype: 1,
      _id: 0,
    },
  },
};

// Optimized endpoint for map data only
router.get('/map/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { filters } = req.query;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    const query = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

    // Apply filters if provided
    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.assign(query, parsedFilters);
    }

    const projection = mapFields[organism] || {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      _id: 0,
    };

    // Ensure we have a connected client before querying
    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const result = await collection.find(query, { projection }).toArray();

    console.log(`[Map API] Found ${result.length} documents for ${organism}`);
    res.json(result);
  } catch (error) {
    console.error(`[Map API] Error retrieving map data for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optimized endpoint for genotypes chart data
router.get('/genotypes/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { filters } = req.query;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    const query = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.assign(query, parsedFilters);
    }

    const projection = chartFields[organism]?.genotypes || {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      _id: 0,
    };

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const result = await collection.find(query, { projection }).toArray();

    console.log(`[Genotypes API] Found ${result.length} documents for ${organism}`);
    res.json(result);
  } catch (error) {
    console.error(`[Genotypes API] Error retrieving genotypes data for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optimized endpoint for resistance data
router.get('/resistance/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { filters } = req.query;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    const query = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.assign(query, parsedFilters);
    }

    const projection = chartFields[organism]?.resistance || {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      _id: 0,
    };

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const result = await collection.find(query, { projection }).toArray();

    console.log(`[Resistance API] Found ${result.length} documents for ${organism}`);
    res.json(result);
  } catch (error) {
    console.error(`[Resistance API] Error retrieving resistance data for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optimized endpoint for trends data
router.get('/trends/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { filters } = req.query;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    const query = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.assign(query, parsedFilters);
    }

    const projection = chartFields[organism]?.trends || {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      _id: 0,
    };

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const result = await collection.find(query, { projection }).toArray();

    console.log(`[Trends API] Found ${result.length} documents for ${organism}`);
    res.json(result);
  } catch (error) {
    console.error(`[Trends API] Error retrieving trends data for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optimized endpoint for convergence data (K. pneumoniae specific)
router.get('/convergence/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { groupVariable, filters } = req.query;

  if (organism !== 'kpneumo') {
    return res.status(400).json({ error: 'Convergence data only available for K. pneumoniae' });
  }

  const dbAndCollection = dbAndCollectionNames[organism];

  try {
    const query = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.assign(query, parsedFilters);
    }

    const projection = {
      COUNTRY_ONLY: 1,
      DATE: 1,
      GENOTYPE: 1,
      cgST: 1,
      Sublineage: 1,
      [groupVariable]: 1,
      _id: 0,
    };

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const result = await collection.find(query, { projection }).toArray();

    console.log(`[Convergence API] Found ${result.length} documents for ${organism}`);
    res.json(result);
  } catch (error) {
    console.error(`[Convergence API] Error retrieving convergence data for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optimized endpoint for global overview filters
router.get('/filters/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { colorBy, selectDrugs } = req.query;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    const pipeline = [
      {
        $match: { 'dashboard view': { $regex: /^include$/, $options: 'i' } },
      },
    ];

    // Add aggregation based on colorBy and selectDrugs
    if (colorBy === 'country') {
      pipeline.push({
        $group: {
          _id: '$COUNTRY_ONLY',
          count: { $sum: 1 },
          genotypes: { $addToSet: '$GENOTYPE' },
        },
      });
    } else if (colorBy === 'genotype') {
      pipeline.push({
        $group: {
          _id: '$GENOTYPE',
          count: { $sum: 1 },
          countries: { $addToSet: '$COUNTRY_ONLY' },
        },
      });
    }

    // Add drug-specific aggregation if selectDrugs is provided
    if (selectDrugs) {
      const drugs = selectDrugs.split(',');
      const drugFields = {};
      drugs.forEach(drug => {
        drugFields[drug] = `$${drug}`;
      });

      pipeline.push({
        $addFields: drugFields,
      });
    }

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const result = await collection.aggregate(pipeline).toArray();

    console.log(`[Filters API] Generated ${result.length} filter results for ${organism}`);
    res.json(result);
  } catch (error) {
    console.error(`[Filters API] Error retrieving filter data for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get available filter options for an organism
router.get('/filters/:organism/options', async (req, res) => {
  const organism = req.params.organism;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    // Get unique values for filter options
    const pipeline = [
      {
        $match: { 'dashboard view': { $regex: /^include$/, $options: 'i' } },
      },
      {
        $group: {
          _id: null,
          countries: { $addToSet: '$COUNTRY_ONLY' },
          genotypes: { $addToSet: '$GENOTYPE' },
          years: { $addToSet: '$DATE' },
        },
      },
    ];

    // Add organism-specific fields
    if (organism === 'kpneumo') {
      pipeline[1].$group.cgST = { $addToSet: '$cgST' };
      pipeline[1].$group.sublineages = { $addToSet: '$Sublineage' };
    }

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const result = await collection.aggregate(pipeline).toArray();

    const options = result[0] || {};

    // Clean and sort the options
    Object.keys(options).forEach(key => {
      if (Array.isArray(options[key])) {
        options[key] = options[key].filter(Boolean).sort();
      }
    });

    console.log(`[Filter Options API] Retrieved options for ${organism}`);
    res.json(options);
  } catch (error) {
    console.error(`[Filter Options API] Error retrieving options for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Paginated endpoint for large datasets (especially E. coli with 227k+ docs)
router.get('/paginated/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { filters, page = 1, limit = 10000, dataType = 'map' } = req.query;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    const query = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

    if (organism === 'kpneumo') query.GENOTYPE = { $ne: null };

    // Apply filters if provided
    if (filters) {
      const parsedFilters = JSON.parse(filters);
      // Validate that all filter values are primitives (string, number, boolean, or null)
      for (const [key, value] of Object.entries(parsedFilters)) {
        if (
          typeof value === 'object' && value !== null ||
          typeof value === 'function' ||
          Array.isArray(value)
        ) {
          return res.status(400).json({ error: 'Invalid filter value: must be a primitive.' });
        }
        query[key] = value;
      }
    }

    // Get appropriate projection based on data type
    let projection;
    if (dataType === 'map') {
      projection = mapFields[organism] || { COUNTRY_ONLY: 1, DATE: 1, GENOTYPE: 1, _id: 0 };
    } else {
      projection = chartFields[organism]?.[dataType] || { COUNTRY_ONLY: 1, DATE: 1, GENOTYPE: 1, _id: 0 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const totalCount = await collection.countDocuments(query);

    // Get paginated results
    const result = await collection.find(query, { projection }).skip(skip).limit(limitNum).toArray();

    const totalPages = Math.ceil(totalCount / limitNum);
    const payloadSize = (JSON.stringify(result).length / 1024 / 1024).toFixed(2);

    console.log(`[Paginated API] ${organism} page ${page}: ${result.length} docs, ${payloadSize}MB`);

    res.json({
      data: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      performance: {
        payloadSize: `${payloadSize}MB`,
        documentCount: result.length,
      },
    });
  } catch (error) {
    console.error(`[Paginated API] Error retrieving data for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Aggregated summary endpoint for quick overview (minimal data transfer)
router.get('/summary/:organism', async (req, res) => {
  const organism = req.params.organism;
  const { filters } = req.query;

  const dbAndCollection = dbAndCollectionNames[organism];
  if (!dbAndCollection) {
    return res.status(400).json({ error: 'Invalid organism' });
  }

  try {
    const baseQuery = { 'dashboard view': { $regex: /^include$/, $options: 'i' } };

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      Object.assign(baseQuery, parsedFilters);
    }

    // Get aggregated summary data
    const summaryPipeline = [
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          countries: { $addToSet: '$COUNTRY_ONLY' },
          genotypes: { $addToSet: '$GENOTYPE' },
          dateRange: {
            $push: {
              $dateFromString: {
                dateString: '$DATE',
                onError: null,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalDocuments: 1,
          countryCount: { $size: '$countries' },
          genotypeCount: { $size: '$genotypes' },
          countries: { $slice: ['$countries', 20] }, // Limit to top 20 for summary
          genotypes: { $slice: ['$genotypes', 20] },
          estimatedPayloadMB: {
            $round: [{ $multiply: ['$totalDocuments', 0.0008] }, 2], // Rough estimate
          },
        },
      },
    ];

    const summary = await getAggregatedDataWithTimeout(
      dbAndCollection.dbName,
      dbAndCollection.collectionName,
      summaryPipeline,
    );

    console.log(`[Summary API] Retrieved summary for ${organism}`);
    res.json(summary[0] || { totalDocuments: 0 });
  } catch (error) {
    console.error(`[Summary API] Error retrieving summary for ${organism}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== OPTIMIZED FULL DATA ENDPOINTS ==========
// These endpoints replace the original slow API calls with streaming and progress monitoring

// Optimized streaming endpoint for K. pneumoniae
router.get('/getDataForKpneumo', async function (req, res, next) {
  const startTime = performance.now();
  const dbAndCollection = dbAndCollectionNames['kpneumo'];

  try {
    console.log('🔄 [OPTIMIZED] Starting Kpneumo paginated data fetch...');

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    // Get count first for progress tracking
    const totalCount = await collection.countDocuments({ 'dashboard view': 'include', GENOTYPE: { $ne: null } });
    console.log(`📊 [OPTIMIZED] Total Kpneumo documents to fetch: ${totalCount}`);

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 1000;
    const skip = (page - 1) * pageSize;

    // Use cursor for memory-efficient streaming
    const docs = await collection
      .find({ 'dashboard view': 'include', GENOTYPE: { $ne: null } })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const results = [];
    let processedCount = 0;

    // Stream processing
    results.push(...docs);
    processedCount = docs.length;

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    const rate = Math.round(results.length / (totalTime / 1000));
    console.log(
      `✅ [OPTIMIZED] Kpneumo fetch completed: ${results.length} documents in ${totalTime}ms (${rate} docs/sec)`,
    );

    res.json({
      data: results,
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error('❌ [OPTIMIZED] Kpneumo error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optimized streaming endpoint for E. coli
router.get('/getDataForEcoli', async function (req, res, next) {
  const startTime = performance.now();
  const dbAndCollection = dbAndCollectionNames['ecoli'];

  try {
    console.log('🔄 [OPTIMIZED] Starting Ecoli data fetch...');

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const totalCount = await collection.countDocuments({
      'dashboard view': { $regex: /^include$/, $options: 'i' },
      GENOTYPE: { $ne: null },
    });
    console.log(`📊 [OPTIMIZED] Total Ecoli documents to fetch: ${totalCount}`);

    const cursor = collection
      .find({ 'dashboard view': { $regex: /^include$/, $options: 'i' }, GENOTYPE: { $ne: null } })
      .batchSize(2000);

    const results = [];
    let processedCount = 0;

    for await (const doc of cursor) {
      results.push(doc);
      processedCount++;

      if (processedCount % 10000 === 0) {
        const elapsed = performance.now() - startTime;
        const rate = Math.round(processedCount / (elapsed / 1000));
        console.log(
          `⏳ [OPTIMIZED] Ecoli progress: ${processedCount}/${totalCount} (${Math.round(elapsed)}ms, ${rate} docs/sec)`,
        );
      }
    }

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    const rate = Math.round(results.length / (totalTime / 1000));
    console.log(
      `✅ [OPTIMIZED] Ecoli fetch completed: ${results.length} documents in ${totalTime}ms (${rate} docs/sec)`,
    );

    res.json(results);
  } catch (error) {
    console.error('❌ [OPTIMIZED] Ecoli error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optimized streaming endpoint for E. coli (diarrheagenic)
router.get('/getDataForDEcoli', async function (req, res, next) {
  const startTime = performance.now();
  const dbAndCollection = dbAndCollectionNames['decoli'];

  try {
    console.log('🔄 [OPTIMIZED] Starting DEcoli data fetch...');

    const connectedClient = await getConnectedClient();
    const collection = connectedClient.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName);

    const totalCount = await collection.countDocuments({ 'dashboard view': 'include', GENOTYPE: { $ne: null } });
    console.log(`📊 [OPTIMIZED] Total DEcoli documents to fetch: ${totalCount}`);

    const cursor = collection.find({ 'dashboard view': 'include', GENOTYPE: { $ne: null } }).batchSize(2000);

    const results = [];
    let processedCount = 0;

    for await (const doc of cursor) {
      results.push(doc);
      processedCount++;

      if (processedCount % 10000 === 0) {
        const elapsed = performance.now() - startTime;
        const rate = Math.round(processedCount / (elapsed / 1000));
        console.log(
          `⏳ [OPTIMIZED] DEcoli progress: ${processedCount}/${totalCount} (${Math.round(elapsed)}ms, ${rate} docs/sec)`,
        );
      }
    }

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    const rate = Math.round(results.length / (totalTime / 1000));
    console.log(
      `✅ [OPTIMIZED] DEcoli fetch completed: ${results.length} documents in ${totalTime}ms (${rate} docs/sec)`,
    );

    res.json(results);
  } catch (error) {
    console.error('❌ [OPTIMIZED] DEcoli error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
