import express from 'express';
const router = express.Router();
import {client} from '../../config/db2.js'
import {createObjectCsvWriter as createCsvWriter} from 'csv-writer';
import * as Tools from '../../services/services.js';
import combine7 from "../../models/AggregatePipeline/Combine7.js";
import DownloadCSV from "../../models/AggregatePipeline/DownloadCSV.js";
import stats from "../../models/AggregatePipeline/pw_stats.js";
import prediction from "../../models/AggregatePipeline/pw_species-prediction.js";
import metadata from "../../models/AggregatePipeline/pw_metadata.js";
import snps from "../../models/AggregatePipeline/pw_amr_snps.js";
import pw_profile from "../../models/AggregatePipeline/pw_amr_profile.js";
import genes from "../../models/AggregatePipeline/pw_amr_genes.js";


// const connection = client.db("amr_t");
router.get('/download', async (req, res) => {

  const db = client.db('amr_t');
  const collection = db.collection('combine7');

  // Perform the aggregation and find all documents
  collection.aggregate(DownloadCSV).toArray((err, data) => {
    if (err) {
      console.error('Error querying MongoDB:', err);
      client.close();
      return;
    }

  // Check if there is at least one document
    if (data.length > 0) {
      // Use the keys of the first document as headers
      const header = Object.keys(data[0]);
      const headerList = [...header];

      // Use map to transform the headerList into the desired header object
      const headerL = headerList.map(fieldName => ({ id: fieldName, title: fieldName }));

      const csvWriter = createCsvWriter({
        path: Tools.path_clean_all_st, // Specify the CSV file path where you want to save the data
        header: headerL, // Use the dynamically generated header
      });

      // Add the header row to the data
      // const dataWithHeader = [data];
      //  console.log("dataWithHeader", dataWithHeader);

      // Write data to the CSV file
      csvWriter.writeRecords(data)
        .then(() => {
          console.log('CSV file downloaded successfully!');
          client.close();
        })
        .catch((csvError) => {
          console.error('Error writing CSV:', csvError);
          client.close();
      });
    }

  });
});

export default router;
