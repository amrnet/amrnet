import express from 'express';
const router = express.Router();
import csv from 'csv-parser';
import fs from 'fs';
import * as Tools from '../../services/services.js';
import { client } from '../../config/db2.js';

const dbAndCollectionNames = {
  styphi: { dbName: 'styphi', collectionName: 'merge_rawdata_st' },
  kpneumo: { dbName: 'kpneumo', collectionName: 'merge_rawdata_kp' },
  ngono: { dbName: 'ngono', collectionName: 'merge_rawdata_ng' },
  ecoli: { dbName: 'ecoli', collectionName: 'merge_rawdata_ec' },
  decoli: { dbName: 'decoli', collectionName: 'merge_rawdata_dec' },
  shige: { dbName: 'shige', collectionName: 'merge_rawdata_sh' },
  senterica: { dbName: 'senterica', collectionName: 'merge_rawdata_se' },
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

const fieldsToProject = Object.keys(sentericaintsFieldsToAdd).reduce(
  (acc, key) => ({ ...acc, [key]: 1 }),
  { NAME: 1 }, // always include NAME for matching
);

// Get all data from the clean file inside assets
router.get('/getDataForSTyphi', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['styphi'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_st;
      fs.createReadStream(read_file)
        .on('error', (_) => {
          return res.json([]);
        })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
          return res.json(results);
        });
    } else return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForKpneumo', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['kpneumo'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'Include' })
      .project({
        HOST: 0,
        'ISOLATION SOURCE': 0,
        'COLLECTED BY': 0,
        STRAIN: 0,
        'MLST ST (PubMLST)': 0,
        'NG-STAR TYPE': 0,
        'NG-MAST POR': 0,
        'NG-MAST TBPB': 0,
        mtrR_promoter_mosaic_2: 0,
        'mtrR_promoter_a-57del': 0,
        rplD_G70D: 0,
        mtrC_disrupted: 0,
        penA_G545S: 0,
        penA_V316T: 0,
        gyrA_S91F: 0,
        gyrA_D95G: 0,
        gyrA_D95A: 0,
        gyrA_D95N: 0,
        parC_S87R: 0,
        parC_D86N: 0,
        parC_S87N: 0,
        parC_S87I: 0,
        parC_E91K: 0,
        mtrR_disrupted: 0,
        penA_ins346D: 0,
        penA_A501T: 0,
        penA_G542S: 0,
        penA_A501V: 0,
        penA_P551S: 0,
        porB1b_A121D: 0,
        porB1b_G120K: 0,
        porB1b_A121N: 0,
        ponA1_L421P: 0,
        folP_R228S: 0,
        rpsJ_V57M: 0,
        mtrR_promoter_mosaic_1: 0,
        penA_T483S: 0,
        penA_A311V: 0,
        parC_S88P: 0,
        'mtrR_promoter_g-131a': 0,
        'mtrR_promoter_a-56c': 0,
        mtrD_mosaic_1: 0,
        penA_A501P: 0,
        parE_G410V: 0,
        '16S_rDNA_c1184t': 0,
        tetM_disrupted: 0,
        ermC: 0,
        mtrD_mosaic_2: 0,
        rpsE_T24P: 0,
        mtrD_mosaic_3: 0,
        mtrR_promoter_mosaic_3: 0,
        'rplV_----90ARAK': 0,
        'rplV_------83KGPSLK': 0,
        rpoB_R201H: 0,
        'rpoD_D92-': 0,
        'rpoD_D93-': 0,
        'rpoD_D94-': 0,
        'rpoD_A95-': 0,
        rpoD_E98K: 0,
        blaTEM_disrupted: 0,
        rpoB_P157L: 0,
        'COLLECTION LABEL': 0,
        latitude: 0,
        longitude: 0,
        day: 0,
        month: 0,
        'Study accession': 0,
        'Alternative sample name 1': 0,
        'Run accession': 0,
        Host: 0,
        'Sample accession': 0,
        'Isolation source': 0,
        'Closest cgST': 0,
        lincode: 0,
        'Clonal Group': 0,
        Identity: 0,
        Identical: 0,
        'Compared Loci Count': 0,
        'Closest profile(s)': 0,
        gapA: 0,
        infB: 0,
        mdh: 0,
        pgi: 0,
        phoE: 0,
        rpoB: 0,
        tonB: 0,
        contig_count: 0,
        N50: 0,
        largest_contig: 0,
        total_size: 0,
        ambiguous_bases: 0,
        QC_warnings: 0,
        num_resistance_genes: 0,
        YbST: 0,
        Colibactin: 0,
        CbST: 0,
        AbST: 0,
        Salmochelin: 0,
        SmST: 0,
        RmST: 0,
        rmpA2: 0,
        wzi: 0,
        K_type: 0,
        K_locus_problems: 0,
        K_locus_confidence: 0,
        O_type: 0,
        O_locus_problems: 0,
        O_locus_confidence: 0,
        MLS_acquired: 0,
        Rif_acquired: 0,
        Bla_acquired: 0,
        SHV_mutations: 0,
        Omp_mutations: 0,
        truncated_resistance_hits: 0,
        spurious_resistance_hits: 0,
        Chr_ST: 0,
        ybtS: 0,
        'Genome Length': 0,
        No: 0,
        'Smallest Contig': 0,
        'Largest Contig': 0,
        'Average Contig Length': 0,
        'GC Content': 0,
        'Species Identifier': 0,
      })
      .toArray();
    console.log(result.length);
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
      .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_ng;
      fs.createReadStream(read_file)
        .on('error', (_) => {
          return res.json([]);
        })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
          return res.json(results);
        });
    } else return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForEcoli', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['ecoli'];
  try {
    // await client.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName).createIndex({ Name: 1 });

    // await client
    //   .db(dbAndCollection.dbName)
    //   .collection('ecoli-output-full') // Use actual collection name
    //   .createIndex({ strain_name: 1 });

    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'Include' } },
        {
          $lookup: {
            from: 'ecoli-output-full',
            let: { nameField: '$Name' },
            pipeline: [{ $match: { $expr: { $eq: ['$strain_name', '$$nameField'] } } }, { $project: fieldsToProject }],
            as: 'extraData',
          },
        },
        { $addFields: { extraData: { $arrayElemAt: ['$extraData', 0] } } },
        { $addFields: sentericaintsFieldsToAdd },
        { $project: { extraData: 0 } },
      ])
      .toArray();

    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_sh;
      fs.createReadStream(read_file)
        .on('error', (_) => {
          return res.json([]);
        })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
          return res.json(results);
        });
    } else return res.json(result);
    // return res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForDEcoli', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['decoli'];
  try {
    // await client.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName).createIndex({ Name: 1 });

    // await client
    //   .db(dbAndCollection.dbName)
    //   .collection('ecoli-output-full') // Use actual collection name
    //   .createIndex({ strain_name: 1 });

    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'Include' } },
        {
          $lookup: {
            from: 'ecoli-output-full',
            let: { nameField: '$Name' },
            pipeline: [{ $match: { $expr: { $eq: ['$strain_name', '$$nameField'] } } }, { $project: fieldsToProject }],
            as: 'extraData',
          },
        },
        { $addFields: { extraData: { $arrayElemAt: ['$extraData', 0] } } },
        { $addFields: sentericaintsFieldsToAdd },
        { $project: { extraData: 0 } },
      ])
      .toArray();

    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_sh;
      fs.createReadStream(read_file)
        .on('error', (_) => {
          return res.json([]);
        })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
          return res.json(results);
        });
    } else return res.json(result);
    // return res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForShige', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['shige'];
  try {
    // await client.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName).createIndex({ Name: 1 });

    // await client
    //   .db(dbAndCollection.dbName)
    //   .collection('ecoli-output-full') // Use actual collection name
    //   .createIndex({ strain_name: 1 });

    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'Include' } },
        {
          $lookup: {
            from: 'ecoli-output-full',
            let: { nameField: '$Name' },
            pipeline: [{ $match: { $expr: { $eq: ['$strain_name', '$$nameField'] } } }, { $project: fieldsToProject }],
            as: 'extraData',
          },
        },
        { $addFields: { extraData: { $arrayElemAt: ['$extraData', 0] } } },
        { $addFields: sentericaintsFieldsToAdd },
        { $project: { extraData: 0 } },
      ])
      .toArray();

    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_sh;
      fs.createReadStream(read_file)
        .on('error', (_) => {
          return res.json([]);
        })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
          return res.json(results);
        });
    } else return res.json(result);
    // return res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForSenterica', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['senterica'];
  try {
    // await client.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName).createIndex({ name: 1 });

    // await client
    //   .db(dbAndCollection.dbName)
    //   .collection('senterica-output-full') // Use actual collection name
    //   .createIndex({ NAME: 1 });

    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'Include' } },
        {
          $lookup: {
            from: 'senterica-output-full',
            let: { nameField: '$name' },
            pipeline: [{ $match: { $expr: { $eq: ['$NAME', '$$nameField'] } } }, { $project: fieldsToProject }],
            as: 'extraData',
          },
        },
        { $addFields: { extraData: { $arrayElemAt: ['$extraData', 0] } } },
        { $addFields: sentericaintsFieldsToAdd },
        { $project: { extraData: 0 } },
      ])
      .toArray();

    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_se;
      fs.createReadStream(read_file)
        .on('error', (_) => {
          return res.json([]);
        })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
          return res.json(results);
        });
    } else return res.json(result);
    // return res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDataForSentericaints', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['sentericaints'];
  try {
    // await client.db(dbAndCollection.dbName).collection(dbAndCollection.collectionName).createIndex({ NAME: 1 });

    // await client
    //   .db(dbAndCollection.dbName)
    //   .collection('senterica-output-full') // Use actual collection name
    //   .createIndex({ NAME: 1 });

    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .aggregate([
        { $match: { 'dashboard view': 'Include' } },
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
      ])
      // .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_seints;
      fs.createReadStream(read_file)
        .on('error', (_) => {
          return res.json([]);
        })
        .pipe(csv())
        .on('data', (data_) => results.push(data_))
        .on('end', () => {
          return res.json(results);
        });
    } else return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getCollectionCounts', async function (req, res, next) {
  try {
    // Perform asynchronous counting of documents in parallel across databases
    const countPromises = Object.values(dbAndCollectionNames).map(({ dbName, collectionName }) => {
      return client.db(dbName).collection(collectionName).countDocuments({ 'dashboard view': 'Include' });
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

router.get('/getUNR', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['unr'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({})
      .toArray();

    console.log(result.length);
    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
