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
      })
      .toArray();
    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_kp;
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
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_ec;
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

router.get('/getDataForDEcoli', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['decoli'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log(result.length);
    if (result.length < 1) {
      let results = [];
      let read_file = Tools.path_clean_dec;
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

router.get('/getDataForShige', async function (req, res, next) {
  const dbAndCollection = dbAndCollectionNames['shige'];
  try {
    const result = await client
      .db(dbAndCollection.dbName)
      .collection(dbAndCollection.collectionName)
      .find({ 'dashboard view': 'Include' })
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
      .find({ 'dashboard view': 'Include' })
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
      .find({ 'dashboard view': 'Include' })
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
      acc[key] = counts[index].toLocaleString('pt-br');
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
