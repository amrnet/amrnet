import express from 'express';
const router = express.Router();
import csv from 'csv-parser';
import fs from 'fs';
import * as Tools from '../../services/services.js';
import {client} from '../../config/db2.js';

// Get all data from the clean file inside assets
router.get('/getDataForSTyphi', async function (req, res, next) {
  try {
        const result = await client.db("styphi").collection("merge_rawdata_st").find({ 'dashboard view': 'Include' }).toArray();;
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

router.get('/getDataForKpneumo', async function (req, res, next) {
  try {
        const result = await client.db("kpneumo").collection("merge_rawdata_kp").find({ 'dashboard view': 'Include' }).toArray();;
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

router.get('/getDataForNgono', async function (req, res, next) {
  try {
        const result = await client.db("ngono").collection("merge_rawdata_ng").find({ 'dashboard view': 'Include' }).toArray();;
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

router.get('/getDataForEcoli', async function (req, res, next) {
  try {
        const result = await client.db("ecoli").collection("merge_rawdata_ec").find({ 'dashboard view': 'Include' }).toArray();;
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

router.get('/getDataForShige', async function (req, res, next) {
  try {
        const result = await client.db("shige").collection("merge_rawdata_sh").find({ 'dashboard view': 'Include' }).toArray();;
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

router.get('/getDataForSalmonella', async function (req, res, next) {
  try {
        const result = await client.db("salmonella").collection("merge_rawdata_se").find({ 'dashboard view': 'Include' }).toArray();;
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
export default router;
