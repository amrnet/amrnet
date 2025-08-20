import { parentPort, workerData } from 'worker_threads';
import processData from './processData.js';

// Enhanced worker with better error handling and logging
const { inputDir, outputDir, options = {} } = workerData;

// Validate input parameters
if (!inputDir || !outputDir) {
  parentPort.postMessage({
    success: false,
    error: 'Missing required parameters: inputDir and outputDir are required',
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
}

// Set up progress reporting
const reportProgress = progress => {
  parentPort.postMessage({
    type: 'progress',
    progress,
    timestamp: new Date().toISOString(),
  });
};

// Main worker execution
try {
  const startTime = Date.now();

  // Report start
  parentPort.postMessage({
    type: 'start',
    message: `Starting data processing: ${inputDir} -> ${outputDir}`,
    timestamp: new Date().toISOString(),
  });

  // Execute the main processing function
  const result = await processData(inputDir, outputDir, {
    ...options,
    onProgress: reportProgress,
  });

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Report successful completion
  parentPort.postMessage({
    success: true,
    result,
    duration,
    message: `Data processing completed successfully in ${duration}ms`,
    timestamp: new Date().toISOString(),
  });
} catch (error) {
  // Enhanced error reporting
  parentPort.postMessage({
    success: false,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code || 'UNKNOWN_ERROR',
    },
    inputDir,
    outputDir,
    timestamp: new Date().toISOString(),
  });

  // Exit with error code
  process.exit(1);
}

// Handle unexpected errors
process.on('uncaughtException', error => {
  parentPort.postMessage({
    success: false,
    error: {
      message: 'Uncaught exception in worker',
      originalError: error.message,
      stack: error.stack,
    },
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  parentPort.postMessage({
    success: false,
    error: {
      message: 'Unhandled promise rejection in worker',
      reason: reason?.message || reason,
      promise: promise.toString(),
    },
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
