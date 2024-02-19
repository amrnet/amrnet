import express from 'express';
const router = express.Router();
import fs from 'fs';
import {client} from '../../config/db2.js'
import {exec} from "child_process"
import merge_rawdata_st from "../../models/AggregatePipeline/Styphi/merge_rawdata_st.js";
import merge_rawdata_kleb from "../../models/AggregatePipeline/Kpneumo/merge_rawdata_kleb.js";
// import merge_rawdata_ngono from "../../models/AggregatePipeline/ngono/merge_rawdata_ngono.js";


router.get('/typhidata', async (req, res) => {
    console.log("i m in");

    try {
        await client.db("styphi").collection("merge_rawdata_st").drop();
        await client.db("styphi").collection("pw_amr-profile").aggregate(merge_rawdata_st).toArray();

        return res.status(200).send('All data merged successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})
router.get('/klebdata', async (req, res) => {

    try {
        await client.db("kpneumo").collection("merge_rawdata_kleb").drop();
        await client.db("kpneumo").collection("pw_kleborate").aggregate(merge_rawdata_kleb).toArray();
       
        return res.status(200).send('All data merged successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get('/ngonodata', async (req, res) => {
    console.log("i m in");

    try {
        await client.db("ngono").collection("merge_rawdata_ng").drop();
        await client.db("ngono").collection("pw_amr-profile").aggregate(merge_rawdata_ng).toArray();
       
        return res.status(200).send('All data merged successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get('/ecolidata', async (req, res) => {
    console.log("i m in");

    try {
        await client.db("ecoli").collection("merge_rawdata_ec").drop();
        //No aggregate needs (Note: flag to check)
        // await client.db("ecoli2").collection("pw_amr-profile").aggregate(merge_rawdata_ec).toArray();
       
        return res.status(200).send('All data merged successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get('/shigedata', async (req, res) => {
    console.log("i m in");

    try {
        await client.db("shige").collection("merge_rawdata_sh").drop();
        //No aggregate needs (Note: flag to check)
        // const result = await client.db("shige2").collection("merge_rawdata_st").aggregate(clean_merge_st).toArray();
        return res.status(200).send('All data merged successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});
router.get('/salmonelladata', async (req, res) => {
    console.log("i m in");

    try {
        await client.db("salmonella").collection("merge_rawdata_sa").drop();
        //No aggregate needs (Note: flag to check)
        // const result = await client.db("salmonella").collection("merge_rawdata_st").aggregate(clean_merge_st).toArray();
        return res.status(200).send('All data merged successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

export default router;
