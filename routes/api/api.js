import express from 'express';
const router = express.Router();
import csv from 'csv-parser';
import fs from 'fs';
import * as Tools from '../../services/services.js';
import {client} from '../../config/db2.js'

// Get all data from the clean or cleanDB_st file inside assets
router.get('/getDataFromCSV', async function (req, res, next) {
  try {
        const result = await client.db("salmotyphi").collection("mergest").find({ 'Exclude': 'Include' }).toArray();;
        console.log(result.length);
        if(result.length < 1){
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
        }else
          return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getDataFromCSVKlebe', async function (req, res, next) {
  try {
        const result = await client.db("salmotyphi").collection("mergekleb").find({ 'Exclude': 'Include' }).toArray();;
        console.log(result.length);
        if(result.length < 1){
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
        }else
          return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
