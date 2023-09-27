import express from 'express';
const router = express.Router();
import fs from 'fs';
import {client} from '../../config/db2.js'
import combine7 from "../../models/AggregatePipeline/Combine7.js";
import typing from "../../models/AggregatePipeline/pw_typing.js";
import stats from "../../models/AggregatePipeline/pw_stats.js";
import prediction from "../../models/AggregatePipeline/pw_species-prediction.js";
import metadata from "../../models/AggregatePipeline/pw_metadata.js";
import snps from "../../models/AggregatePipeline/pw_amr_snps.js";
import pw_profile from "../../models/AggregatePipeline/pw_amr_profile.js";
import genes from "../../models/AggregatePipeline/pw_amr_genes.js";
import { exec } from "child_process";

const folderPath = '/Users/vandanasharma/LSHTM/New_AMR/Amrnet-/amrnetold/assets/webscrap/raw_data/styphi';

router.get('/data', async (req, res) => {
    const  jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
        
      const collectionName = jsonFile.replace('.json', '');
      const command = `mongoimport  --db='test' --collection='${collectionName}' --file='${folderPath}/${jsonFile}' --jsonArray`

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

    // try {
    //     // await client.db("salmotyphi").collection("pw_typing").aggregate(typing).toArray();
    //     // await client.db("salmotyphi").collection("pw_stats").aggregate(stats).toArray();
    //     // await client.db("salmotyphi").collection("pw_species-prediction").aggregate(prediction).toArray();
    //     // await client.db("salmotyphi").collection("pw_metadata").aggregate(metadata).toArray();
    //     // await client.db("salmotyphi").collection("pw_amr-snps").aggregate(snps).toArray();
    //     // await client.db("salmotyphi").collection("pw_amr-profile").aggregate(pw_profile).toArray();
    //     // await client.db("salmotyphi").collection("pw_amr-genes").aggregate(genes).toArray();
    //     const result = await client.db("salmotyphi").collection("profilecollection").aggregate(combine7).toArray();
    //     return res.json(result);
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: 'Internal Server Error' });
    // }
});


export default router;
