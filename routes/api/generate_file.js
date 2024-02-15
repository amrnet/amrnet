import express from 'express';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as Tools from '../../services/services.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Download clean as spreadsheet
// function to handle downloading file
router.post('/download', function (req, res, next) {
  
// get organism from request body
  const organism = req.body.organism;

// determine file path based on organism
  let path_file = '';

  if (organism === 'typhi') {
    path_file = Tools.path_clean_all_st;
  } else {
    path_file = Tools.path_clean_all_kp;
  }

// set CORS header for download
  res.setHeader('Access-Control-Allow-Origin', '*');
// send file as response
  res.download(path_file);
});

// Get data for admin page: changes and current data
router.get('/databaseLog', function (req, res, next) {
// Define file path
  const path = './assets/database/previousDatabases.txt';
// Read text file contents  
  const text = fs.readFileSync(path, 'utf-8');
// Parse text file into JSON
  const aux = JSON.parse(text);
// Send JSON as response
  return res.json(aux);
});

export default router;
