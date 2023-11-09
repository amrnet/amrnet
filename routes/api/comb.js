import express from 'express';
const router = express.Router();
import fs from 'fs';
import {client} from '../../config/db2.js'
import {exec} from "child_process"
import mergest from "../../models/Agg2/mergest.js";
import mergekleb from "../../models/Agg2/mergekleb.js";


router.get('/data', async (req, res) => {

    try {
        await client.db("salmotyphi").collection("pw_amr-profile").aggregate(mergest).toArray();
        const result = await client.db("salmotyphi").collection("pw_kleborate").aggregate(mergekleb).toArray();
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

const folderPath = `/Users/vandanasharma/Desktop/DATABASE_COMPARE_DATA/all_jsons`;
router.get('/import', async (req, res) => {
    const  jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
        
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport --db 'salmotyphi' --collection '${collectionName}' --upsert --upsertFields 'name,Genome Name,NAME'  --file '${folderPath}/${jsonFile}' --jsonArray`


        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });

    }
});


export default router;
