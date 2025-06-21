import { parentPort, workerData } from 'worker_threads';
import processData from './processData.js';
 
// workerData is expected to be an object like { inputDir: 'path/to/input', outputDir: 'path/to/output' }
const { inputDir, outputDir } = workerData;
 
try {
  // processData can be a long-running operation
  const result = processData(inputDir, outputDir);
  parentPort.postMessage({ success: true, result });
} catch (error) {
  // It's good practice to handle potential errors and report them back
  parentPort.postMessage({ success: false, error: error.message });
}
