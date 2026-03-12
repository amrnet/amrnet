// Worker implementation — runs in a separate thread
// Imports idb.ts helpers directly; bundler (Vite/CRA) will include them in the worker chunk

import { getItems } from '../idb';

self.onmessage = async ({ data: { id, storeName } }) => {
  try {
    const result = await getItems(storeName);
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: err?.message ?? String(err) });
  }
};
