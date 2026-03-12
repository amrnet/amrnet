// Web Worker: runs IDB reads off the main thread so the UI stays responsive
// Usage: import { readStoreInWorker } from './workers/idbWorker';

let worker = null;
let pendingCallbacks = new Map();
let callbackId = 0;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./idbWorkerImpl.js', import.meta.url));
    worker.onmessage = ({ data: { id, result, error } }) => {
      const cb = pendingCallbacks.get(id);
      if (!cb) return;
      pendingCallbacks.delete(id);
      if (error) cb.reject(new Error(error));
      else cb.resolve(result);
    };
    worker.onerror = err => {
      // Reject all pending on fatal worker error
      for (const cb of pendingCallbacks.values()) cb.reject(err);
      pendingCallbacks.clear();
      worker = null;
    };
  }
  return worker;
}

export function readStoreInWorker(storeName) {
  return new Promise((resolve, reject) => {
    const id = ++callbackId;
    pendingCallbacks.set(id, { resolve, reject });
    try {
      getWorker().postMessage({ id, storeName });
    } catch (err) {
      pendingCallbacks.delete(id);
      reject(err);
    }
  });
}
