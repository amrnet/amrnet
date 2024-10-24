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

export default router;
