import { useRef, useCallback } from 'react';

/**
 * Hook to manage Web Worker for expensive graph data computations
 * Prevents blocking the UI thread during heavy computation
 */
export function useGraphWorker() {
  const workerRef = useRef(null);
  const jobsRef = useRef(new Map());
  const jobIdRef = useRef(0);

  // Initialize worker on first use
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      // Create worker from the worker file
      workerRef.current = new Worker(
        new URL('../workers/graphDataWorker.js', import.meta.url),
        { type: 'module' }
      );

      // Handle messages from worker
      workerRef.current.onmessage = (event) => {
        const { jobId, type, success, data, error } = event.data;
        const job = jobsRef.current.get(jobId);

        if (job) {
          if (type === 'RESULT' && success) {
            job.resolve(data);
          } else {
            job.reject(new Error(error || 'Unknown error from worker'));
          }
          jobsRef.current.delete(jobId);
        }
      };

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending jobs
        jobsRef.current.forEach((job) => {
          job.reject(error);
        });
        jobsRef.current.clear();
        workerRef.current = null;
      };
    }

    return workerRef.current;
  }, []);

  /**
   * Compute expensive graph data using Web Worker
   * @param {string} computeType - Type of computation (YEARS_DATA, GENOTYPES_DATA, etc.)
   * @param {object} payload - Data to compute on
   * @param {function} fallback - Fallback computation function if worker fails
   * @returns {Promise} - Promise that resolves with computed data
   */
  const computeAsync = useCallback(
    (computeType, payload, fallback) => {
      return new Promise((resolve, reject) => {
        try {
          const worker = getWorker();
          const jobId = jobIdRef.current++;

          // Store the job promise handlers
          jobsRef.current.set(jobId, { resolve, reject });

          // Send computation request to worker
          worker.postMessage({
            type: `COMPUTE_${computeType}`,
            payload,
            jobId,
          });

          // Set a timeout in case worker hangs
          setTimeout(() => {
            if (jobsRef.current.has(jobId)) {
              jobsRef.current.delete(jobId);
              reject(new Error(`Worker computation timeout for ${computeType}`));
            }
          }, 30000); // 30 second timeout
        } catch (error) {
          // Fall back to main thread computation if worker fails
          console.warn(`Worker computation failed for ${computeType}, falling back to main thread:`, error);
          try {
            const result = fallback();
            resolve(result);
          } catch (fallbackError) {
            reject(fallbackError);
          }
        }
      });
    },
    [getWorker]
  );

  /**
   * Terminate the worker and clean up
   */
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    jobsRef.current.clear();
  }, []);

  return { computeAsync, cleanup };
}
