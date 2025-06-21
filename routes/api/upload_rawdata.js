import CombinedModel from '../models/combined.js';
import express from 'express';
import csv from 'csv-parser';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import fs from 'fs';
import { detailedDiff } from 'deep-object-diff';
import LZString from 'lz-string';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
let URI = process.env.MONGO_URI;

const exec = promisify(execCallback);
const router = express.Router();

// Upload data from admin page to MongoDB
// router.post('/upload/admin', (req, res) => {
//   const path = './assets/database/lastClean.txt';

//   if (req.body.current === 1) {
//     fs.writeFileSync(path, JSON.stringify({ data: [] }));
//   }

//   const text = fs.readFileSync(path, 'utf-8');
//   const aux = JSON.parse(text);

//   const decompressed = LZString.decompress(req.body.data);
//   const object = JSON.parse(decompressed)[0];
//   const array = Object.values(object);
//   aux.data = [...aux.data, ...array];
//   fs.writeFileSync(path, JSON.stringify(aux));

//   if (req.body.current === req.body.parts) {
//     CombinedModel.countDocuments(function (err, count) {
//       if (err) {
//         return res.json({ Status: `Error! ${err}` });
//       }
//       if (count > 0) {
//         CombinedModel.collection.drop();
//       }
//       CombinedModel.insertMany(aux.data, (error) => {
//         if (error) return res.json({ Status: `Error! ${error}` });
//         res.json({ Status: 'Uploaded' });
//       });
//     });
//   } else {
//     res.json('');
//   }
// });

// Check if there were any changes made directly in the MongoDB and update current data from the admin page
// router.get('/checkForChanges', async (req, res) => {
//   let response = [];

//   response = await CombinedModel.find().then(async (comb) => {
//     let send_comb = [];
//     for (let data of comb) {
//       let aux_data = JSON.parse(JSON.stringify(data));
//       delete aux_data['_id'];
//       delete aux_data['__v'];
//       send_comb.push(aux_data);
//     }
//     return send_comb;
//   });

//   const path = './assets/database/previousDatabases.txt';
//   const text = fs.readFileSync(path, 'utf-8');
//   const aux = JSON.parse(text);
//   const collection = aux[aux.length - 1].data;

//   const data = {};
//   for (const i in response) {
//     data[response[i].NAME.toString()] = response[i];
//   }

//   if (collection.length === 0) {
//     aux[aux.length - 1].data = data;
//     fs.writeFileSync(path, JSON.stringify(aux));
//     console.log('New data');
//     res.json({ Status: 'New Data' });
//   } else {
//     const difference = detailedDiff(collection, data);
//     Object.keys(difference.updated).forEach((element) => {
//       for (const key in difference.updated[element]) {
//         difference.updated[element][key] = {
//           new: difference.updated[element][key],
//           old: collection[element][key],
//         };
//       }
//     });
//     Object.keys(difference.deleted).forEach((element) => {
//       difference.deleted[element] = collection[element];
//     });

//     if (Object.keys(difference).filter((x) => Object.keys(difference[x]).length > 0).length > 0) {
//       const currentDate = new Date();
//       aux.splice(0, 0, {
//         updatedAt: currentDate.toISOString(),
//         changes: difference,
//       });
//       aux[aux.length - 1].data = data;
//       aux[aux.length - 1].updatedAt = currentDate.toISOString();
//       fs.writeFileSync(path, JSON.stringify(aux));
//       console.log('Changes: true');
//       res.json({ Status: 'Changes' });
//     } else {
//       console.log('Changes: false');
//       res.json({ Status: 'No Changes' });
//     }
//   }
// });

// // Get last date that the MongoDB was updated
// router.get('/lastUpdated', (req, res) => {
//   const path = './assets/database/previousDatabases.txt';

//   const text = fs.readFileSync(path, 'utf-8');
//   const aux = JSON.parse(text);
//   return res.json(aux[0].updatedAt);
// });

// // Delete specific change from the admin page
// router.post('/deleteChange', (req, res) => {
//   const path = './assets/database/previousDatabases.txt';
//   const id = req.body.id;

//   const text = fs.readFileSync(path, 'utf-8');
//   let aux = JSON.parse(text);
//   aux.splice(id, 1);
//   fs.writeFileSync(path, JSON.stringify(aux));
//   return res.json(aux);
// });

//Upload raw data JSON or CSV format into mongoDB AMRnetDB CSV not implemented

const STyphifolderPath = path.join(__dirname, '../assets/database/rawdata/styphi')
router.get('/upload/styphi', async (req, res) => {
  const jsonFiles = fs.readdirSync(STyphifolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'styphi';

  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${STyphifolderPath}/${jsonFile}' --jsonArray`;

      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data successfully uploaded to MongoDB`);
    return res.status(200).send('All data successfully uploaded to MongoDB');
  } catch (error) {
    console.error('Error uploading data:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const KlebfolderPath = path.join(__dirname, '../assets/datasets/rawdata/kpneumo');
router.get('/upload/kpneumo', async (req, res) => {
  const jsonFiles = fs.readdirSync(KlebfolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'kpneumo';
  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${KlebfolderPath}/${jsonFile}' --jsonArray`;
      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data imported successfully`);
    return res.status(200).send('All data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const NgonofolderPath = path.join(__dirname, '../assets/datasets/rawdata/ngono');
router.get('/upload/ngono', async (req, res) => {
  const jsonFiles = fs.readdirSync(NgonofolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'ngono';
  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${NgonofolderPath}/${jsonFile}' --jsonArray`;
      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data imported successfully`);
    return res.status(200).send('All data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const EcolifolderPath = path.join(__dirname, '../assets/datasets/rawdata/ecoli');
router.get('/upload/ecoli', async (req, res) => {
  const jsonFiles = fs.readdirSync(EcolifolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'ecoli';
  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${EcolifolderPath}/${jsonFile}' --jsonArray`;
      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data imported successfully`);
    return res.status(200).send('All data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).send('Internal Server Error');
  }
});
const DEcolifolderPath = path.join(__dirname, '../assets/datasets/rawdata/decoli');
router.get('/upload/decoli', async (req, res) => {
  const jsonFiles = fs.readdirSync(DEcolifolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'decoli';
  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${DEcolifolderPath}/${jsonFile}' --jsonArray`;
      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data imported successfully`);
    return res.status(200).send('All data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const ShigefolderPath = path.join(__dirname, '../assets/datasets/rawdata/shige');
router.get('/upload/shige', async (req, res) => {
  const jsonFiles = fs.readdirSync(ShigefolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'shige';
  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${ShigefolderPath}/${jsonFile}' --jsonArray`;
      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data imported successfully`);
    return res.status(200).send('All data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const SentericafolderPath = path.join(__dirname, '../assets/datasets/rawdata/senterica');
router.get('/upload/senterica', async (req, res) => {
  const jsonFiles = fs.readdirSync(SentericafolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'senterica';
  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${SentericafolderPath}/${jsonFile}' --jsonArray`;
      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data imported successfully`);
    return res.status(200).send('All data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const SentericaintsfolderPath = path.join(__dirname, '../assets/datasets/rawdata/sentericaints');
router.get('/upload/sentericaints', async (req, res) => {
  const jsonFiles = fs.readdirSync(SentericaintsfolderPath).filter((file) => file.endsWith('.json'));

  const dbName = 'sentericaints';
  try {
    const importPromises = [];
    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --uri '${URI}${dbName}' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${SentericaintsfolderPath}/${jsonFile}' --jsonArray`;
      const importPromise = exec(command);
      importPromises.push(importPromise);
      console.log(`jsonFile: ${jsonFile}`);
    }
    await Promise.all(importPromises);

    console.log(`All data imported successfully`);
    return res.status(200).send('All data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
