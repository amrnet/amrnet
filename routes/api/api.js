import csv from 'csv-parser';
import express from 'express';
import fs from 'fs';
import { MongoClient } from 'mongodb';
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
        console.log(`API routes: Connection attempt ${attempt}/${MAX_CONNECTION_ATTEMPTS}`);
        await client.connect();

        // Test connection
        await client.db('ecoli2').command({ ping: 1 });
        console.log('✅ API routes: MongoDB connection established');
        connectionAttempts = 0; // Reset on success
        break;
      } catch (error) {
        console.error(`❌ API routes: Connection attempt ${attempt} failed:`, error.message);

        if (attempt === MAX_CONNECTION_ATTEMPTS) {
          console.error('🚨 API routes: Max connection attempts reached');
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
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timout')), 100000)),
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

// Initialize client on module load with timeout handling
connectDB().catch(error => {
  console.warn('API routes: MongoDB connection failed:', error.message);
  console.log('API routes will attempt to reconnect on first request');
});

const dbAndCollectionNames = {
  styphi: { dbName: 'styphi', collectionName: 'amrnetdb_styphi' },
  kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
  ngono: { dbName: 'ngono', collectionName: 'amrnetdb_ngono' },
  ecoli: { dbName: 'ecoli', collectionName: 'amrnetdb_ecoli' },
  decoli: { dbName: 'decoli', collectionName: 'amrnetdb_decoli' },
  shige: { dbName: 'shige', collectionName: 'amrnetdb_shige' },
  senterica: { dbName: 'senterica', collectionName: 'sentericatest' },
  sentericaints: { dbName: 'sentericaints', collectionName: 'merge_rawdata_sients' },
  unr: { dbName: 'unr', collectionName: 'unr' },
};

const sentericaintsFieldsToAdd = {
  AMINOGLYCOSIDE: '$extraData.AMINOGLYCOSIDE',
  'BETA-LACTAM': '$extraData.BETA-LACTAM',
  SULFONAMIDE: '$extraData.SULFONAMIDE',
  TETRACYCLINE: '$extraData.TETRACYCLINE',
  QUINOLONE: '$extraData.QUINOLONE',
  'QUATERNARY AMMONIUM': '$extraData.QUATERNARY AMMONIUM',
  'QUINOLONE/TRICLOSAN': '$extraData.QUINOLONE/TRICLOSAN',
  TRIMETHOPRIM: '$extraData.TRIMETHOPRIM',
  PHENICOL: '$extraData.PHENICOL',
  FOSFOMYCIN: '$extraData.FOSFOMYCIN',
  BLEOMYCIN: '$extraData.BLEOMYCIN',
  MACROLIDE: '$extraData.MACROLIDE',
  'AMINOGLYCOSIDE/QUINOLONE': '$extraData.AMINOGLYCOSIDE/QUINOLONE',
  RIFAMYCIN: '$extraData.RIFAMYCIN',
  'LINCOSAMIDE/MACROLIDE/STREPTOGRAMIN': '$extraData.LINCOSAMIDE/MACROLIDE/STREPTOGRAMIN',
  STREPTOTHRICIN: '$extraData.STREPTOTHRICIN',
  MULTIDRUG: '$extraData.MULTIDRUG',
  'PHENICOL/QUINOLONE': '$extraData.PHENICOL/QUINOLONE',
  'MACROLIDE/STREPTOGRAMIN': '$extraData.MACROLIDE/STREPTOGRAMIN',
  COLISTIN: '$extraData.COLISTIN',
  LINCOSAMIDE: '$extraData.LINCOSAMIDE',
  'LINCOSAMIDE/MACROLIDE': '$extraData.LINCOSAMIDE/MACROLIDE',
  STREPTOGRAMIN: '$extraData.STREPTOGRAMIN',
  'PHENICOL/LINCOSAMIDE/OXAZOLIDINONE/PLEUROMUTILIN/STREPTOGRAMIN':
    '$extraData.PHENICOL/LINCOSAMIDE/OXAZOLIDINONE/PLEUROMUTILIN/STREPTOGRAMIN',
  NITROIMIDAZOLE: '$extraData.NITROIMIDAZOLE',
};

// const kpneumoFieldsToIgnore = {
//   Amrnet_id: 0,
//   Amrnet_version: 0,
//   Amrnetdb_date: 0,
//   Amrnetdb_version: 0,
//   Pathogenwatch_id: 0,
//   'MLST (7-locus)': 0,
//   'Genome Length': 0,
//   'lincode': 0,
//   'Clonal Group': 0,
//   'Sample accession': 0,
//   'Study accession': 0,
//   'Purpose of Sampling': 0,
//   'Run accession': 0,
//   contig_count: 0,
//   N50: 0,
//   largest_contig: 0,
//   total_size: 0,
//   YbST: 0,
//   CbST: 0,
//   Colibactin: 0,
//   AbST: 0,
//   SmST: 0,
//   Salmochelin: 0,
//   Ciprofloxacin_profile_support: 0,
//   Ciprofloxacin_profile: 0,
//   Ciprofloxacin_MIC_prediction: 0,
//   K_type: 0,
//   _id: 0,
// };

const fieldsToProject = Object.keys(sentericaintsFieldsToAdd).reduce(
  (acc, key) => ({ ...acc, [key]: 1 }),
  { NAME: 1 }, // always include NAME for matching
);

const readCsvFallback = (filePath, res) => {
  const results = [];
  fs.createReadStream(filePath)
    .on('error', err => {
      console.error(`Error reading fallback file ${filePath}:`, err);
      return res.json([]);
    })
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => {
      return res.json(results);
    });
};

// Main organism data endpoints
router.get('/getDataForSTyphi', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['styphi'];
  try {
    const result = await getDataWithTimeout(dbAndCollection.dbName, dbAndCollection.collectionName, {
      'dashboard view': { $regex: /^include$/, $options: 'i' },
    });

    console.log(`[STyphi API] Found ${result.length} documents for STyphi.`);

    if (result.length > 0) {
      return res.json(result);
    }

    console.warn('[STyphi API] No documents found in the database, falling back to TSV.');

    // Fallback to reading from TSV if no data found in MongoDB
    return readCsvFallback(Tools.path_clean_st, res);
  } catch (error) {
    console.error(`[STyphi API] Error retrieving data for STyphi: ${error.message}`);
    res.status(500).json({ error: `Failed to retrieve STyphi data: ${error.message}` });
  }
});

router.get('/getDataForKpneumo', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['kpneumo'];
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5000;
    const skip = (page - 1) * limit;
    // Projection: only return needed fields
    const projection = {
      GENOTYPE: 1,
      COUNTRY_ONLY: 1,
      DATE: 1,
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
    };
    // Query
    const query = {
      'dashboard view': 'include',
      GENOTYPE: { $ne: null },
    };
    // Get total count
    const client = await connectDB();
    const totalDocuments = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .countDocuments(query);
    // Get paginated data
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find(query)
      .project(projection)
      .skip(skip)
      .limit(limit)
      .toArray();
    console.log(`Found ${result.length} documents for Kpneumo (page ${page}).`);
    return res.json({
      data: result,
      pagination: {
        page,
        limit,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForNgono', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['ngono'];
  try {
    const result = await getDataWithTimeout(dbAndCollection.dbName, dbAndCollection.collectionName, {
      'dashboard view': { $regex: /^include$/, $options: 'i' },
    });

    console.log(`Found ${result.length} documents for Ngono.`);
    if (result.length > 0) {
      return res.json(result);
    }

    return readCsvFallback(Tools.path_clean_ng, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForEcoli', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['ecoli'];
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5000;
    const skip = (page - 1) * limit;
    // Projection: only return needed fields
    const projection = {
      GENOTYPE: 1,
      COUNTRY_ONLY: 1,
      DATE: 1,
      ESBL_category: 1,
      'dashboard view': 1,
      // add more fields as needed
    };
    // Query
    const query = {
      'dashboard view': { $regex: /^include$/, $options: 'i' },
      GENOTYPE: { $ne: null },
    };
    // Get total count
    const client = await connectDB();
    const totalDocuments = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .countDocuments(query);
    // Get paginated data
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find(query)
      .project(projection)
      .skip(skip)
      .limit(limit)
      .toArray();
    console.log(`Found ${result.length} documents for Ecoli (page ${page}).`);
    return res.json({
      data: result,
      pagination: {
        page,
        limit,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForDEcoli', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['decoli'];
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5000;
    const skip = (page - 1) * limit;
    // Projection: only return needed fields
    const projection = {
      GENOTYPE: 1,
      COUNTRY_ONLY: 1,
      DATE: 1,
      ESBL_category: 1,
      'dashboard view': 1,
      // add more fields as needed
    };
    // Query
    const query = {
      'dashboard view': { $regex: /^include$/, $options: 'i' },
      GENOTYPE: { $ne: null },
    };
    // Get total count
    const client = await connectDB();
    const totalDocuments = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .countDocuments(query);
    // Get paginated data
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find(query)
      .project(projection)
      .skip(skip)
      .limit(limit)
      .toArray();
    console.log(`Found ${result.length} documents for DEcoli (page ${page}).`);
    return res.json({
      data: result,
      pagination: {
        page,
        limit,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForShige', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['shige'];
  try {
    const result = await getDataWithTimeout(dbAndCollection.dbName, dbAndCollection.collectionName, {
      'dashboard view': { $regex: /^include$/, $options: 'i' },
      GENOTYPE: { $ne: null },
    });

    console.log(`Found ${result.length} documents for Shige.`);
    if (result.length > 0) {
      return res.json(result);
    }

    return readCsvFallback(Tools.path_clean_sh, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForSenterica', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['senterica'];
  try {
    const pipeline = [
      // { $match: { 'dashboard view': { $regex: /^include$/, $options: 'i' } } },
      { $match: { 'dashboard view': 'Include' } }, // Using exact match for performance
      {
        $project: {
          GENOTYPE: {
            $cond: {
              if: { $ne: ['$MLST_Achtman', null] },
              then: '$MLST_Achtman',
              else: 'Unknown',
            },
          },

          AMINOGLYCOSIDE: 1,
          'BETA-LACTAM': 1,
          SULFONAMIDE: 1,
          TETRACYCLINE: 1,
          NAME: 1,
          DATE: 1,
          COUNTRY_ONLY: 1,
          'SISTR1 Serovar': 1,
          // "dashboard view": 0,
          QUINOLONE: 1,
          TRIMETHOPRIM: 1,
          PHENICOL: 1,
          MACROLIDE: 1,
          COLISTIN: 1,
        },
      },
    ];

    const result = await getAggregatedDataWithTimeout(dbAndCollection.dbName, dbAndCollection.collectionName, pipeline);

    console.log(`Found ${result.length} documents for Senterica.`);
    if (result.length > 0) {
      return res.json(result);
    }

    return readCsvFallback(Tools.path_clean_se, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForSentericaints', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['sentericaints'];
  try {
    const pipeline = [
      { $match: { 'dashboard view': { $regex: /^include$/, $options: 'i' } } },
      {
        $lookup: {
          from: 'senterica-output-full',
          let: { nameField: '$NAME' },
          pipeline: [{ $match: { $expr: { $eq: ['$NAME', '$$nameField'] } } }, { $project: fieldsToProject }],
          as: 'extraData',
        },
      },
      { $addFields: { extraData: { $arrayElemAt: ['$extraData', 0] } } },
      { $addFields: sentericaintsFieldsToAdd },
      { $project: { extraData: 0 } },
    ];

    const result = await getAggregatedDataWithTimeout(dbAndCollection.dbName, dbAndCollection.collectionName, pipeline);

    console.log(`Found ${result.length} documents for Sentericaints.`);
    if (result.length > 0) {
      return res.json(result);
    }

    return readCsvFallback(Tools.path_clean_seints, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getUNR', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['unr'];
  try {
    const result = await getDataWithTimeout(dbAndCollection.dbName, dbAndCollection.collectionName, {});

    console.log(`Found ${result.length} documents for UNR.`);
    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getCollectionCounts', async function (req, res, next) {
  try {
    // Perform asynchronous counting of documents in parallel across databases
    const countPromises = Object.entries(dbAndCollectionNames).map(([key, { dbName, collectionName }]) => {
      return getCollectionCountWithTimeout(dbName, collectionName, {
        'dashboard view': { $regex: /^include$/, $options: 'i' },
        $or: [{ GENOTYPE: { $ne: null } }, { ST: { $ne: null } }, { MLST_Achtman: { $ne: null } }],
      });
    });

    // Wait for all counts to resolve
    const counts = await Promise.all(countPromises);

    // Get object with counts
    const result = Object.keys(dbAndCollectionNames).reduce((acc, key, index) => {
      acc[key] = counts[index].toLocaleString('fi-FI');
      return acc;
    }, {});

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add helper function for country name normalization
// function getCountryDisplayName(country) {
//   if (!country) return '';
//   const trimmed = country.trim();

//   switch (trimmed) {
//     case 'Democratic Republic of the Congo':
//     case 'Democratic Republic of Congo':
//     case 'DR Congo':
//     case 'DRC':
//       return 'Dem. Rep. Congo';
//     case 'Republic of the Congo':
//     case 'Congo Republic':
//       return 'Congo';
//     case 'Channel Islands':
//       return 'Jersey';
//     case 'Czech Republic':
//       return 'Czechia';
//     case 'Central African Republic':
//       return 'Central African Rep.';
//     case 'Ivory Coast':
//     case "Cote d'Ivoire":
//     case "Côte d'Ivoire":
//       return "Côte d'Ivoire";
//     case 'East Timor':
//       return 'Timor-Leste';
//     case 'State of Palestine':
//       return 'Palestine';
//     case 'Dominican Republic':
//       return 'Dominican Rep.';
//     case 'Viet Nam':
//       return 'Vietnam';
//     case 'Myanmar [Burma]':
//       return 'Myanmar';
//     case 'French Polynesia':
//       return 'Fr. Polynesia';
//     case 'The Netherlands':
//     case 'Netherlands (Kingdom of the)':
//       return 'Netherlands';
//     case 'USA':
//     case 'United States':
//       return 'United States of America';
//     case 'Cape Verde':
//       return 'Cabo Verde';
//     case 'Turks and Caicos Islands':
//       return 'Turks and Caicos Is.';
//     case 'United Kingdom (England/Wales/N. Ireland)':
//     case 'United Kingdom (Scotland)':
//     case 'United Kingdom of Great Britain and Northern Ireland':
//     case 'Northern Ireland':
//     case 'England':
//     case 'Scotland':
//     case 'Wales':
//     case 'UK':
//       return 'United Kingdom';
//     case 'The Gambia':
//       return 'Gambia';
//     case 'Poland/Hungary':
//       return 'Poland';
//     case "Lao People's Democratic Republic":
//       return 'Laos';
//     case 'Syrian Arab Republic':
//       return 'Syria';
//     case 'United Republic of Tanzania':
//       return 'Tanzania';
//     case 'Türkiye':
//       return 'Turkey';
//     default:
//       return trimmed;
//   }
// }

export default router;
