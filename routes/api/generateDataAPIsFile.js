import pkg from 'csv-writer';
import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import { client } from '../../config/db.js';
import { STYPHI_PERSONAL_FIELDS_EXCLUSION } from '../../config/personalFields.js';
import * as Tools from '../../services/services.js';

const { createObjectCsvWriter: createCsvWriter } = pkg;
const { createObjectCsvStringifier: createCsvStringifier } = pkg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// ---------------------------------------------------------------------------
// Shigella/EIEC export shaping (July 2026 review)
//
// The shige collection is the whole Enterobase E. coli set (~168k genomes); the
// dashboard and its download are about Shigella + EIEC only, so the export is
// restricted to those Pathovar values (~59k). Redundant/unused columns are
// dropped, the truncated LINcode levels are dropped in favour of the full
// `LINcode`, and two columns are renamed for clarity.
// ---------------------------------------------------------------------------
const SHIGE_PATHOVAR_FILTER = /shigella|EIEC/i;

// Columns kept in the Shigella/EIEC export, in output order. Resistance marker
// columns are listed explicitly so they are always present even though they are
// sparsely populated (see the header-union fix below).
const SHIGE_EXPORT_COLUMNS = [
  // identity / provenance
  'Name',
  'sample_accession',
  'DATE',
  'COUNTRY_ONLY',
  // typing
  'GENOTYPE',
  'Pathovar',
  'species',
  'LINcode',
  'O Antigen',
  'H Antigen',
  'Serotype',
  // virulence / pathotype determinants used by the dashboard
  'ipaH',
  'pInv',
  'stx1',
  'stx2',
  'eae',
  'ST_toxin',
  'LT_toxin',
  // AMR — the point of the download
  'amr_gene_count',
  'Aminoglycoside',
  'Beta-lactam',
  'Colistin',
  'Fosfomycin',
  'Fosmidomycin',
  'Lincosamide',
  'Macrolide',
  'Nitrofuran',
  'Phenicol',
  'Quaternary_ammonium',
  'Quinolone',
  'Rifamycin',
  'Streptothricin',
  'Sulfonamide',
  'Tetracycline',
  'Trimethoprim',
];

// Header renames requested in the review.
const SHIGE_COLUMN_RENAMES = {
  DATE: 'Year',
  GENOTYPE: 'Sequence type',
  COUNTRY_ONLY: 'Country',
};

// Download clean as spreadsheet with compression
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
    collection = client.db('ngono').collection('amrnetdb_ngono');
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
    collection = client.db('sentericaints').collection('amrnetdb_ints');
    localFilePath = Tools.path_clean_all_sh;
  } else {
    collection = client.db('senterica').collection('amrnetdb_senterica');
    localFilePath = Tools.path_clean_all_se;
  }
  let data;
  try {
    // Exclude styphi patient-level fields from the export (no-op for other
    // organisms, which do not carry these fields).
    const findOptions = organism === 'styphi' ? { projection: STYPHI_PERSONAL_FIELDS_EXCLUSION } : {};
    // Only export genomes curated for dashboard display, matching every other
    // read endpoint (routes/api/api.js) - without this, the export pulled in
    // every raw record in the collection, including genomes not identified/
    // curated as belonging to this organism's dashboard.
    const query = { 'dashboard view': { $regex: /^include$/i } };
    // The shige collection holds the whole Enterobase E. coli set; restrict to
    // Shigella/EIEC pathovars (see SHIGE_PATHOVAR_FILTER above) so the export
    // matches the dashboard instead of exporting every E. coli genome too.
    if (organism === 'shige') {
      query.Pathovar = SHIGE_PATHOVAR_FILTER;
    }
    data = await collection.find(query, findOptions).toArray();
    console.log('2', data.length, 'documents found');
  } catch (err) {
    console.error('Error querying MongoDB:', err);
    return res.status(500).send('Database error');
  }

  let csvString;

  if (data.length > 0) {
    // Union of keys across all documents - MongoDB is schemaless, so relying on
    // just data[0] silently dropped any field absent from the first record even
    // when populated on other rows (e.g. resistance marker columns).
    const headerList = [...data.reduce((keys, doc) => {
      Object.keys(doc).forEach(key => keys.add(key));
      return keys;
    }, new Set())];
    let nameField = organism === 'shige' || organism === 'decoli' ? 'Name' : 'NAME';

    let rearrangedHeaderList;
    if (organism === 'shige') {
      // Curated column set — only the variables the dashboard uses, with the
      // redundant truncated LINcode levels and unused source_* fields dropped.
      rearrangedHeaderList = SHIGE_EXPORT_COLUMNS.filter(f => headerList.includes(f));
    } else {
      const filteredHeaderList = headerList.filter(
        fieldName =>
          fieldName !== nameField &&
          fieldName !== 'DATE' &&
          fieldName !== 'COUNTRY' &&
          fieldName !== 'COUNTRY_ONLY' &&
          fieldName !== 'PMID' &&
          fieldName !== 'GENOTYPE',
      );
      rearrangedHeaderList =
        organism === 'styphi' || organism === 'ngono'
          ? [nameField, 'DATE', 'COUNTRY_ONLY', 'PMID', 'GENOTYPE', ...filteredHeaderList]
          : [nameField, 'DATE', 'COUNTRY_ONLY', 'GENOTYPE', ...filteredHeaderList];
    }

    const renames = organism === 'shige' ? SHIGE_COLUMN_RENAMES : {};
    const headerL = rearrangedHeaderList.map(fieldName => ({
      id: fieldName,
      title: renames[fieldName] ?? fieldName,
    }));

    const csvStringifier = createCsvStringifier({ header: headerL });
    const records = data.map(doc => {
      const flatDoc = {};
      rearrangedHeaderList.forEach(key => {
        flatDoc[key] = doc[key] ?? '';
      });

      return flatDoc;
    });

    csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  } else if (fs.existsSync(localFilePath)) {
    csvString = fs.readFileSync(localFilePath, 'utf8');
  }

  // Check if client accepts gzip compression
  const acceptsGzip = req.headers['accept-encoding'] && req.headers['accept-encoding'].includes('gzip');

  if (acceptsGzip && csvString && csvString.length > 1024) {
    // Compress the TSV data
    const compressed = zlib.gzipSync(csvString);

    res.setHeader('Content-Disposition', `attachment; filename="${organism}.csv.gz"`);
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.send(compressed);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${organism}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.send(csvString || '');
  }
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
    collection = client.db('ngono').collection('amrnetdb_ngono');
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
    // Exclude styphi patient-level fields (no-op for other organisms).
    const findOptions = organism === 'styphi' ? { projection: STYPHI_PERSONAL_FIELDS_EXCLUSION } : {};
    const queryResult = await collection.find({}, findOptions).toArray();
    if (queryResult.length > 0) {
      // Remove the '_id' field from each document
      const sanitizedData = queryResult.map(doc => {
        const { _id, __v, ...rest } = doc;
        return rest;
      });

      const csvWriter = createCsvWriter({
        path: `../../assets/webscrap/clean/${folderName}/cleanAll_${ext}.csv`,
        header: Object.keys(sanitizedData[0]).map(field => ({
          id: field,
          title: field,
        })),
      });

      await csvWriter.writeRecords(sanitizedData);
      console.log('TSV file successfully created.');
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
    // Exclude styphi patient-level fields (no-op for other organisms).
    const findOptions = organism === 'styphi' ? { projection: STYPHI_PERSONAL_FIELDS_EXCLUSION } : {};
    const queryResult = await client
      .db(`${database}`)
      .collection(`merge_rawdata_${collection_ext}`)
      .find({ 'dashboard view': 'Include' }, findOptions)
      .toArray();
    console.log('queryResult', queryResult.length);
    if (queryResult.length > 0) {
      const csvWriter = createCsvWriter({
        path: path.join(__dirname, `../../assets/webscrap/clean/${folderName}/clean_${ext}.csv`),
        header: Object.keys(queryResult[0]).map(field => ({
          id: field,
          title: field,
        })),
      });

      await csvWriter.writeRecords(queryResult);
      console.log('TSV file successfully created.');
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
