import { execFile as execFileCallback } from 'child_process';
import { detailedDiff } from 'deep-object-diff';
import express from 'express';
import fs from 'fs';
import LZString from 'lz-string';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import CombinedModel from '../models/combined.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const URI = process.env.MONGODB_URI;

const execFile = promisify(execFileCallback);
const router = express.Router();

// Upload data from admin page to MongoDB
router.post('/upload/admin', (req, res) => {
  const path = './assets/database/lastClean.txt';

  if (req.body.current === 1) {
    fs.writeFileSync(path, JSON.stringify({ data: [] }));
  }

  const text = fs.readFileSync(path, 'utf-8');
  const aux = JSON.parse(text);

  const decompressed = LZString.decompress(req.body.data);
  const object = JSON.parse(decompressed)[0];
  const array = Object.values(object);
  aux.data = [...aux.data, ...array];
  fs.writeFileSync(path, JSON.stringify(aux));

  if (req.body.current === req.body.parts) {
    CombinedModel.countDocuments(function (err, count) {
      if (err) {
        return res.json({ Status: `Error! ${err}` });
      }
      if (count > 0) {
        CombinedModel.collection.drop();
      }
      CombinedModel.insertMany(aux.data, error => {
        if (error) return res.json({ Status: `Error! ${error}` });
        res.json({ Status: 'Uploaded' });
      });
    });
  } else {
    res.json('');
  }
});

// Check if there were any changes made directly in the MongoDB and update current data from the admin page
router.get('/checkForChanges', async (req, res) => {
  let response = [];

  response = await CombinedModel.find().then(async comb => {
    let send_comb = [];
    for (let data of comb) {
      let aux_data = JSON.parse(JSON.stringify(data));
      delete aux_data['_id'];
      delete aux_data['__v'];
      send_comb.push(aux_data);
    }
    return send_comb;
  });

  const path = './assets/database/previousDatabases.txt';
  const text = fs.readFileSync(path, 'utf-8');
  const aux = JSON.parse(text);
  const collection = aux[aux.length - 1].data;

  const data = {};
  for (const i in response) {
    data[response[i].NAME.toString()] = response[i];
  }

  if (collection.length === 0) {
    aux[aux.length - 1].data = data;
    fs.writeFileSync(path, JSON.stringify(aux));
    console.log('New data');
    res.json({ Status: 'New Data' });
  } else {
    const difference = detailedDiff(collection, data);
    Object.keys(difference.updated).forEach(element => {
      for (const key in difference.updated[element]) {
        difference.updated[element][key] = {
          new: difference.updated[element][key],
          old: collection[element][key],
        };
      }
    });
    Object.keys(difference.deleted).forEach(element => {
      difference.deleted[element] = collection[element];
    });

    if (Object.keys(difference).filter(x => Object.keys(difference[x]).length > 0).length > 0) {
      const currentDate = new Date();
      aux.splice(0, 0, {
        updatedAt: currentDate.toISOString(),
        changes: difference,
      });
      aux[aux.length - 1].data = data;
      aux[aux.length - 1].updatedAt = currentDate.toISOString();
      fs.writeFileSync(path, JSON.stringify(aux));
      console.log('Changes: true');
      res.json({ Status: 'Changes' });
    } else {
      console.log('Changes: false');
      res.json({ Status: 'No Changes' });
    }
  }
});

// Get last date that the MongoDB was updated
router.get('/lastUpdated', (req, res) => {
  const path = './assets/database/previousDatabases.txt';

  const text = fs.readFileSync(path, 'utf-8');
  const aux = JSON.parse(text);
  return res.json(aux[0].updatedAt);
});

// Delete specific change from the admin page
router.post('/deleteChange', (req, res) => {
  const path = './assets/database/previousDatabases.txt';
  const id = req.body.id;

  const text = fs.readFileSync(path, 'utf-8');
  let aux = JSON.parse(text);
  aux.splice(id, 1);
  fs.writeFileSync(path, JSON.stringify(aux));
  return res.json(aux);
});

// Import raw json data into mongoDB
const importRouteConfig = {
  styphi: path.join(__dirname, '../assets/webscrap/clean/styphi'),
  kpneumo: path.join(__dirname, '../assets/webscrap/clean/kpneumo'),
  ngono: path.join(__dirname, '../assets/webscrap/clean/ngono'),
  ecoli: path.join(__dirname, '../assets/webscrap/clean/ecoli'),
  decoli: path.join(__dirname, '../assets/webscrap/clean/decoli'),
  shige: path.join(__dirname, '../assets/webscrap/clean/shige'),
  senterica: path.join(__dirname, '../assets/webscrap/clean/senterica'),
  sentericaints: path.join(__dirname, '../assets/webscrap/clean/sentericaints'),
  saureus:       path.join(__dirname, '../assets/webscrap/clean/saureus'),
  strepneumo:    path.join(__dirname, '../assets/webscrap/clean/strepneumo'),
};

const importOrganismJsonFiles = async (organism, folderPath) => {
  const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

  const importPromises = jsonFiles.map(jsonFile => {
    const collectionName = jsonFile.replace('.json', '');
    const args = [
      '--uri',
      `${URI}${organism}`,
      '--collection',
      collectionName,
      '--upsert',
      '--upsertFields',
      'name,Genome Name,NAME',
      '--file',
      path.join(folderPath, jsonFile),
      '--jsonArray',
    ];

    console.log(`jsonFile: ${jsonFile}`);
    return execFile('mongoimport', args);
  });

  await Promise.all(importPromises);
};

Object.entries(importRouteConfig).forEach(([organism, folderPath]) => {
  router.get(`/import/${organism}`, async (req, res) => {
    try {
      await importOrganismJsonFiles(organism, folderPath);
      console.log('All data imported successfully');
      return res.status(200).send('All data imported successfully');
    } catch (error) {
      console.error(`Error importing data for ${organism}:`, error);
      return res.status(500).send('Internal Server Error');
    }
  });
});

export default router;
