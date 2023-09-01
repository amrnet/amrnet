import express from 'express';
const router = express.Router();
import combine7 from "../../models/AggregatePipeline/Combine7.js";
import {client} from '../../config/db2.js'

router.get('/data', async (req, res) => {
    try {
        const result = await client.db("amr_t").collection("profile").aggregate(combine7).toArray();
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;
