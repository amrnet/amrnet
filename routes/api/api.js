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
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
