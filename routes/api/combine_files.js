import express from 'express';
const router = express.Router();
import fs from 'fs';
import {client} from '../../config/db2.js'
import {exec} from "child_process"
import merge_rawdata_st from "../../models/AggregatePipeline/Styphi/merge_rawdata_st.js";
import merge_rawdata_kleb from "../../models/AggregatePipeline/Kpneumo/merge_rawdata_kleb.js";
import clean_merge_st from "../../models/AggregatePipeline/Styphi/clean_merge_st.js";
import clean_merge_kleb from "../../models/AggregatePipeline/Kpneumo/clean_merge_kleb.js";


router.get('/typhidata', async (req, res) => {
    console.log("i m in");

    try {
        await client.db("salmotyphi2").collection("merge_rawdata_st").drop();
        await client.db("salmotyphi2").collection("pw_amr-profile").aggregate(merge_rawdata_st).toArray();
       
        // const result = await client.db("salmotyphi2").collection("merge_rawdata_st").aggregate(clean_merge_st).toArray();
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});
router.get('/klebdata', async (req, res) => {

    try {
        await client.db("salmotyphi2").collection("merge_rawdata_kleb").drop();
        await client.db("klebpnneumo2").collection("pw_kleborate").aggregate(merge_rawdata_kleb).toArray();
        // const result = await client.db("klebpnneumo2").collection("merge_rawdata_kleb").aggregate(clean_merge_kleb).toArray();
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

export default router;
