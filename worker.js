import {
  parentPort,
  workerData
} from 'worker_threads';
import {
  processData
} from './processData.js';

const {
  data
} = workerData;

const result = processData(data);

parentPort.postMessage(result);
