import express from 'express';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as Tools from '../../services/services.js';
import { client } from '../../config/db.js';
import pkg from 'csv-writer';

const { createObjectCsvWriter: createCsvWriter } = pkg;
const { createObjectCsvStringifier: createCsvStringifier } = pkg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Download clean as spreadsheet
router.post('/download', async function (req, res, next) {
  const organism = req.body.organism;
  let collection, localFilePath;

  if (organism === 'styphi') {
    collection = client.db('styphi').collection('amrnetdb_styphi');
    localFilePath = Tools.path_clean_all_st;
  } else if (organism === 'kpneumo') {
    collection = client.db('kpneumo').collection('amrnetdb_kpneumo');
    localFilePath = Tools.path_clean_all_kp;
  } else if (organism === 'ngono') {
    collection = client.db('ngono').collection('merge_rawdata_ng');
    localFilePath = Tools.path_clean_all_ng;
  } else if (organism === 'ecoli') {
    collection = client.db('ecoli').collection('amrnetdb_ecoli');
    localFilePath = Tools.path_clean_all_ec;
  } else if (organism === 'decoli') {
    collection = client.db('decoli').collection('amrnetdb_decoli');
    localFilePath = Tools.path_clean_all_ec;
  } else if (organism === 'shige') {
    collection = client.db('shige').collection('amrnetdb_shige');
    localFilePath = Tools.path_clean_all_sh;
  } else if (organism === 'sentericaints') {
    collection = client.db('sentericaints').collection('merge_rawdata_sients');
    localFilePath = Tools.path_clean_all_sh;
  } else {
    collection = client.db('senterica').collection('sentericatest');
    localFilePath = Tools.path_clean_all_se;
  }
  let data;
  try {
    data = await collection.find({}).toArray();
    console.log('2', data.length, 'documents found');
  } catch (err) {
    console.error('Error querying MongoDB:', err);
    return res.status(500).send('Database error');
  }
  let csvString;

  if (data.length > 0) {
    const header = Object.keys(data[0]);
    const headerList = [...header];
    let nameField = (organism === 'shige' || organism === 'decoli') ? 'Name' : 'NAME';

    const filteredHeaderList = headerList.filter(fieldName =>
      fieldName !== nameField &&
      fieldName !== 'DATE' &&
      fieldName !== 'COUNTRY' &&
      fieldName !== 'COUNTRY_ONLY' &&
      fieldName !== 'PMID' &&
      fieldName !== 'GENOTYPE'
    );
    const rearrangedHeaderList = (organism === 'styphi' || organism === 'ngono')
      ? [nameField, 'DATE', 'COUNTRY_ONLY', 'PMID', 'GENOTYPE', ...filteredHeaderList]
      : [nameField, 'DATE', 'COUNTRY_ONLY', 'GENOTYPE', ...filteredHeaderList];

    const headerL = rearrangedHeaderList.map(fieldName => ({
      id: fieldName,
      title: fieldName,
    }));

    const csvStringifier = createCsvStringifier({ header: headerL });
    const records = data.map((doc) => {
    const flatDoc = {};
      rearrangedHeaderList.forEach((key) => {
        flatDoc[key] = doc[key] ?? '';
      });

      return flatDoc;
    });

    csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

    } else if (fs.existsSync(localFilePath)) {
    csvString = fs.readFileSync(localFilePath, 'utf8');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${organism}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.send(csvString || '');

});

//Generate clean_all_st and clean_all_kp
router.get('/generate/:organism', async function (req, res, next) {
  const organism = req.params.organism;
  let collection, folderName, fileName, ext, collection_ext;

  if (organism === 'styphi') {
    collection = client.db('styphi').collection('amrnetdb_styphi');
    folderName = 'styphi';
    ext = 'st';
    collection_ext = 'st';
    fileName = 'cleanAll_st.csv';
  } else if (organism === 'kpneumo') {
    collection = client.db('kpneumo').collection('amrnetdb_kpneumo');
    folderName = 'kpneumo';
    ext = 'kp';
    collection_ext = 'kp';
    fileName = 'cleanAll_kp.csv';
  } else if (organism === 'ngono') {
    collection = client.db('ngono').collection('merge_rawdata_ng');
    folderName = 'ngono';
    ext = 'ng';
    collection_ext = 'ng';
    fileName = 'cleanAll_ng.csv';
  } else if (organism === 'ecoli') {
    collection = client.db('ecoli').collection('amrnetdb_ecoli');
    folderName = 'ecoli';
    ext = 'ec';
    collection_ext = 'ec';
    fileName = 'cleanAll_ec.csv';
  } else if (organism === 'decoli') {
    collection = client.db('decoli').collection('amrnetdb_decoli');
    folderName = 'decoli';
    ext = 'dec';
    collection_ext = 'dec';
    fileName = 'cleanAll_dec.csv';
  } else if (organism === 'shige') {
    collection = client.db('shige').collection('amrnetdb_shige');
    folderName = 'shige';
    ext = 'sh';
    collection_ext = 'sh';
    fileName = 'cleanAll_sh.csv';
  } else if (organism === 'sentericaints') {
    collection = client.db('sentericaints').collection('merge_rawdata_sients');
    folderName = 'sentericaints';
    ext = 'seints';
    collection_ext = 'seints';
    fileName = 'cleanAll_seints.csv';
  } else {
    collection = client.db('senterica').collection('sentericatest');
    folderName = 'senterica';
    ext = 'se';
    collection_ext = 'se';
    fileName = 'cleanAll_se.csv';
  }

  try {
    const queryResult = await collection.find().toArray();
    if (queryResult.length > 0) {
      // Remove the '_id' field from each document
      const sanitizedData = queryResult.map((doc) => {
        const { _id, __v, ...rest } = doc;
        return rest;
      });

      const csvWriter = createCsvWriter({
        path: `../../assets/webscrap/clean/${folderName}/cleanAll_${ext}.csv`,
        header: Object.keys(sanitizedData[0]).map((field) => ({
          id: field,
          title: field,
        })),
      });

      await csvWriter.writeRecords(sanitizedData);
      console.log('CSV file successfully created.');
    } else {
      console.log('No data to export.');
    }
    return res.status(200).send(queryResult);
  } catch (error) {
    console.error('Error processing MongoDB query:', error);
  }
});

//Generate clean_st and clean_kp file in database
router.get('/clean/:organism', async function (req, res, next) {
  const organism = req.params.organism;
  let folderName, ext, database, collection_ext;
  if (organism === 'styphi') {
    folderName = 'styphi';
    ext = 'st';
    collection_ext = 'st';
    database = 'styphi';
  } else if (organism === 'kpneumo') {
    folderName = 'kpneumo';
    ext = 'kp';
    collection_ext = 'kp';
    database = 'kpneumo';
  } else if (organism === 'ngono') {
    folderName = 'ngono';
    ext = 'ng';
    collection_ext = 'ng';
    database = 'ngono';
  } else if (organism === 'ecoli') {
    folderName = 'ecoli';
    ext = 'ec';
    collection_ext = 'ec';
    database = 'ecoli';
  } else if (organism === 'decoli') {
    folderName = 'decoli';
    ext = 'dec';
    collection_ext = 'dec';
    database = 'decoli';
  } else if (organism === 'shige') {
    folderName = 'shige';
    ext = 'sh';
    collection_ext = 'sh';
    database = 'shige';
  } else if (organism === 'sentericaints') {
    folderName = 'sentericaints';
    ext = 'seints';
    collection_ext = 'seints';
    database = 'sentericaints';
  } else {
    folderName = 'senterica';
    ext = 'se';
    collection_ext = 'se';
    database = 'senterica';
  }

  try {
    const queryResult = await client
      .db(`${database}`)
      .collection(`merge_rawdata_${collection_ext}`)
      .find({ 'dashboard view': 'Include' })
      .toArray();
    console.log('queryResult', queryResult.length);
    if (queryResult.length > 0) {
      const csvWriter = createCsvWriter({
        path: path.join(__dirname, `../../assets/webscrap/clean/${folderName}/clean_${ext}.csv`),
        header: Object.keys(queryResult[0]).map((field) => ({
          id: field,
          title: field,
        })),
      });

      await csvWriter.writeRecords(queryResult);
      console.log('CSV file successfully created.');
    } else {
      console.log('No data to export.');
    }
    return res.status(200).send(queryResult);
  } catch (error) {
    console.error('Error processing MongoDB query:', error);
  }
});

// Get data for admin page: changes and current data
router.get('/databaseLog', function (req, res, next) {
  const path = './assets/database/previousDatabases.txt';
  const text = fs.readFileSync(path, 'utf-8');
  const aux = JSON.parse(text);
  return res.json(aux);
});

export default router;
