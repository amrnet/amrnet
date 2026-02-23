import ObjectsToCsv from 'objects-to-csv';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const path_clean_st = path.join(__dirname, '../assets/webscrap/clean/styphi/clean_st.csv');
const path_clean_kp = path.join(__dirname, '../assets/webscrap/clean/kpneumo/clean_kp.csv');
const path_clean_ng = path.join(__dirname, '../assets/webscrap/clean/ngono/clean_ng.csv');
const path_clean_ec = path.join(__dirname, '../assets/webscrap/clean/ecoli/clean_ec.csv');
const path_clean_dec = path.join(__dirname, '../assets/webscrap/clean/decoli/clean_dec.csv');
const path_clean_sh = path.join(__dirname, '../assets/webscrap/clean/shige/clean_sh.csv');
const path_clean_se = path.join(__dirname, '../assets/webscrap/clean/senterica/clean_se.csv');
const path_clean_seints = path.join(__dirname, '../assets/webscrap/clean/sentericaints/clean_seints.csv');
const path_clean_sa = path.join(__dirname, '../assets/webscrap/clean/saureus/clean_sa.csv');
const path_clean_sp = path.join(__dirname, '../assets/webscrap/clean/spneumo/clean_sp.csv');
const path_clean_all_kp = path.join(__dirname, '../assets/webscrap/clean/kpneumo/cleanAll_kp.csv');
const path_clean_all_st = path.join(__dirname, '../assets/webscrap/clean/styphi/cleanAll_st.csv');
const path_clean_all_ng = path.join(__dirname, '../assets/webscrap/clean/ngono/cleanAll_ng.csv');
const path_clean_all_ec = path.join(__dirname, '../assets/webscrap/clean/ecoli/cleanAll_ec.csv');
const path_clean_all_sh = path.join(__dirname, '../assets/webscrap/clean/shige/cleanAll_sh.csv');
const path_clean_all_se = path.join(__dirname, '../assets/webscrap/clean/senterica/cleanAll_se.csv');
const path_clean_all_decoli = path.join(__dirname, '../assets/webscrap/clean/decoli/cleanAll_decoli.csv');
const path_clean_all_seints = path.join(__dirname, '../assets/webscrap/clean/sentericaints/cleanAll_seints.csv');
const path_clean_all_sa = path.join(__dirname, '../assets/webscrap/clean/saureus/cleanAll_sa.csv');
const path_clean_all_sp = path.join(__dirname, '../assets/webscrap/clean/spneumo/cleanAll_sp.csv');
var path_clean_db_st;
const watcher = chokidar.watch(path.join(__dirname, '../assets/webscrap/clean/styphi/'), {
  ignored: /^\./,
  persistent: true,
});

watcher
  .on('add', function () {
    fs.readdir('./assets/webscrap/clean/styphi/', function (error, files) {
      if (files.indexOf('cleanDB_st.csv') != -1) {
        path_clean_db_st = path.join(__dirname, '../assets/webscrap/clean/styphi/cleanDB_st.csv');
      } else {
        path_clean_db_st = undefined;
      }
    });
  })
  .on('unlink', function () {
    fs.readdir('./assets/webscrap/clean/styphi/', function (error, files) {
      if (files.indexOf('cleanDB_st.csv') != -1) {
        path_clean_db_st = path.join(__dirname, '../assets/webscrap/clean/styphi/cleanDB_st.csv');
      } else {
        path_clean_db_st = undefined;
      }
    });
  });

async function CreateFile(data, name) {
  const csv_writer = new ObjectsToCsv(data);
  const save_path = path.join(__dirname, `../assets/webscrap/clean/styphi/${name}`);
  await csv_writer.toDisk(save_path);
}

export {
  CreateFile,
  path_clean_db_st,
  path_clean_st,
  path_clean_kp,
  path_clean_ng,
  path_clean_ec,
  path_clean_sh,
  path_clean_se,
  path_clean_sa,
  path_clean_sp,
  path_clean_all_st,
  path_clean_all_kp,
  path_clean_all_ec,
  path_clean_all_ng,
  path_clean_all_sh,
  path_clean_all_se,
  path_clean_all_sa,
  path_clean_all_sp,
};
