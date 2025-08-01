import express from 'express';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import csv from 'csv-parser';

const router = express.Router();

// MongoDB client setup
let client;
const connectDB = async () => {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
  }
  return client;
};

// Initialize client on module load
connectDB().catch(console.error);

const dbAndCollectionNames = {
  styphi: { dbName: 'styphi', collectionName: 'amrnetdb_styphi' },
  kpneumo: { dbName: 'kpneumo', collectionName: 'amrnetdb_kpneumo' },
  ngono: { dbName: 'ngono', collectionName: 'merge_rawdata_ng' },
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
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': { $regex: /^include$/, $options: 'i' } })
      .toArray();

    console.log(`[STyphi API] Found ${result.length} documents for STyphi.`);

    if (result.length > 0) {
      return res.json(result);
    }

    console.warn('[STyphi API] No documents found in the database, falling back to CSV.');

    // Fallback to reading from CSV if no data found in MongoDB
    return readCsvFallback(Tools.path_clean_st, res);
  } catch (error) {
    console.error(`[STyphi API] Error retrieving data for STyphi: ${error.message}`);
    res.status(500).json({ error: `Failed to retrieve STyphi data: ${error.message}` });
  }
});

router.get('/getDataForKpneumo', async function (req, res, next) {

  const dbAndCollection = dbAndCollectionNames['kpneumo'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': { $regex: /^include$/, $options: 'i' }, GENOTYPE: { $ne: null } })
      .toArray();

    console.log(`Found ${result.length} documents for Kpneumo.`);
    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForNgono', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['ngono'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': { $regex: /^include$/, $options: 'i' } })
      .toArray();

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
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': { $regex: /^include$/, $options: 'i' }, GENOTYPE: { $ne: null } })
      .toArray();

    console.log(`Found ${result.length} documents for Ecoli.`);
    if (result.length > 0) {
      return res.json(result);
    }

    return readCsvFallback(Tools.path_clean_ec, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForDEcoli', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['decoli'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': { $regex: /^include$/, $options: 'i' }, GENOTYPE: { $ne: null } })
      .toArray();

    console.log(`Found ${result.length} documents for DEcoli.`);
    if (result.length > 0) {
      return res.json(result);
    }

    return readCsvFallback(Tools.path_clean_dec, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForShige', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['shige'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': { $regex: /^include$/, $options: 'i' }, GENOTYPE: { $ne: null } })
      .toArray();

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
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': { $regex: /^include$/, $options: 'i' } } },
        {
          $addFields: {
            GENOTYPE: {
              $cond: {
                if: { $ne: ['$MLST_Achtman', null] },
                then: '$MLST_Achtman',
                else: 'Unknown',
              },
            },
          },
        },
        {
          $project: {
            MLST_Achtman: 0, // remove original field if renaming
          },
        },
      ])
      .toArray();

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
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': { $regex: /^include$/, $options: 'i' } } },
        {
          $lookup: {
            from: 'senterica-output-full',
            let: { nameField: '$NAME' },
            pipeline: [
              { $match: { $expr: { $eq: ['$NAME', '$$nameField'] } } },
              { $project: fieldsToProject }
            ],
            as: 'extraData',
          },
        },
        { $addFields: { extraData: { $arrayElemAt: ['$extraData', 0] } } },
        { $addFields: sentericaintsFieldsToAdd },
        { $project: { extraData: 0 } },
      ])
      .toArray();

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
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({})
      .toArray();

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
      return client
        .db(dbName)
        .collection(collectionName)
        .countDocuments({
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
