import ObjectsToCsv from 'objects-to-csv';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const path_clean_st = path.join(
  __dirname,
  '../assets/webscrap/clean/styphi/clean_st.csv'
);
const path_clean_all_kp = path.join(
  __dirname,
  '../assets/webscrap/clean/klebpneumo/cleanAll_kp.csv'
);
const path_clean_all_st = path.join(
  __dirname,
  '../assets/webscrap/clean/styphi/cleanAll_st.csv'
);
var path_clean_db_st;
const watcher = chokidar.watch(
  path.join(__dirname, '../assets/webscrap/clean/styphi/'),
  { ignored: /^\./, persistent: true }
);

watcher
  .on('add', function () {
    fs.readdir('./assets/webscrap/clean/styphi/', function (error, files) {
      if (files.indexOf('cleanDB_st.csv') != -1) {
        path_clean_db_st = path.join(
          __dirname,
          '../assets/webscrap/clean/styphi/cleanDB_st.csv'
        );
      } else {
        path_clean_db_st = undefined;
      }
    });
  })
  .on('unlink', function () {
    fs.readdir('./assets/webscrap/clean/styphi/', function (error, files) {
      if (files.indexOf('cleanDB_st.csv') != -1) {
        path_clean_db_st = path.join(
          __dirname,
          '../assets/webscrap/clean/styphi/cleanDB_st.csv'
        );
      } else {
        path_clean_db_st = undefined;
      }
    });
  });

async function CreateFile(data, name) {
  const csv_writer = new ObjectsToCsv(data);
  const save_path = path.join(
    __dirname,
    `../assets/webscrap/clean/styphi/${name}`
  );
  await csv_writer.toDisk(save_path);
}

export {
  CreateFile,
  path_clean_db_st,
  path_clean_st,
  path_clean_all_st,
  path_clean_all_kp
};
