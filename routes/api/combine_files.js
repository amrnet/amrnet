import express from 'express';
const router = express.Router();
import fs from 'fs';
import {client} from '../../config/db2.js'
import {exec} from "child_process"
import merge_rawdata_st from "../../models/Agg2/Styphi/merge_rawdata_st.js";
import merge_rawdata_kleb from "../../models/Agg2/Kpneumo/merge_rawdata_kleb.js";
import clean_merged_st from "../../models/Agg2/Styphi/clean_merged_st.js";
import clean_merged_kleb from "../../models/Agg2/Kpneumo/clean_merged_kleb.js";


router.get('/typhidata', async (req, res) => {
    console.log("i m in");

    try {
        await client.db("salmotyphi").collection("pw_amr-profile").aggregate(merge_rawdata_st).toArray();
        const result = await client.db("salmotyphi").collection("merge_rawdata_st").aggregate(clean_merged_st).toArray();
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});
router.get('/klebdata', async (req, res) => {

    try {
        await client.db("klebpnneumo").collection("pw_kleborate").aggregate(merge_rawdata_kleb).toArray();
        const result = await client.db("klebpnneumo").collection("merge_rawdata_kleb").aggregate(clean_merged_kleb).toArray();
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

export default router;
