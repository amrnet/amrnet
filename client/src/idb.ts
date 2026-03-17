import * as compressJson from 'compress-json';
import { IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'amrnetdb';
// Bump version when schema changes (e.g., new indexes)
const DB_VERSION = 39;

// List of all stores used by the app
const OBJECT_STORES = [
  'styphi',
  'kpneumo',
  'ngono',
  'ecoli',
  'decoli',
  'shige',
  'sentericaints',
  'senterica',
  // 'styphi_sets',
  'styphi_map',
  'styphi_genotype',
  'styphi_years',
  'styphi_map_regions',
  'styphi_drugs_countries',
  'styphi_drugs_regions',
  'kpneumo_map',
  'kpneumo_genotype',
  'kpneumo_years',
  'kpneumo_ko',
  'kpneumo_ko_years',
  'kpneumo_convergence',
  'kpneumo_map_regions',
  'kpneumo_drugs_countries',
  'kpneumo_drugs_regions',
  'ngono_map',
  'ngono_genotype',
  'ngono_ngmast',
  'ngono_years',
  'ngono_map_regions',
  'ngono_drugs_countries',
  'ngono_drugs_regions',
  'ecoli_map',
  'ecoli_map_regions',
  'ecoli_genotype',
  'ecoli_years',
  'ecoli_drugs_countries',
  'ecoli_drugs_regions',
  'decoli_map',
  'decoli_map_regions',
  'decoli_genotype',
  'decoli_years',
  'decoli_drugs_countries',
  'decoli_drugs_regions',
  'shige_map',
  'shige_map_regions',
  'shige_genotype',
  'shige_years',
  'shige_drugs_countries',
  'shige_drugs_regions',
  'sentericaints_map',
  'sentericaints_map_regions',
  'sentericaints_genotype',
  'sentericaints_years',
  'sentericaints_drugs_countries',
  'sentericaints_drugs_regions',
  'senterica_map',
  'senterica_map_regions',
  'senterica_genotype',
  'senterica_years',
  'senterica_drugs_countries',
  'senterica_drugs_regions',
  'saureus',
  'saureus_map',
  'saureus_map_regions',
  'saureus_genotype',
  'saureus_years',
  'saureus_drugs_countries',
  'saureus_drugs_regions',
  'strepneumo',
  'strepneumo_map',
  'strepneumo_map_regions',
  'strepneumo_genotype',
  'strepneumo_years',
  'strepneumo_drugs_countries',
  'strepneumo_drugs_regions',
  'unr',
];

// Main organism stores used with typed helpers

// Initialize the database (singleton pattern)
let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Remove all existing object stores if needed (essentially clearing the cache)
        Array.from(db.objectStoreNames).forEach(storeName => {
          db.deleteObjectStore(storeName);
        });

        // Base organism stores that benefit from a DATE index for range queries
        const ORGANISM_STORES = new Set([
          'styphi', 'kpneumo', 'ngono', 'ecoli', 'decoli',
          'shige', 'senterica', 'sentericaints', 'saureus', 'strepneumo',
        ]);

        // Recreate object stores with the updated schema
        OBJECT_STORES.forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            const os = db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });

            if (ORGANISM_STORES.has(store)) {
              // DATE index for fast year-range filtering on every organism
              os.createIndex('dateIndex', 'DATE', { unique: false });

              if (store === 'styphi') {
                // Composite index for styphi which also filters by TRAVEL
                os.createIndex('travelDateIndex', ['TRAVEL', 'DATE'], { unique: false });
              }
            }
          }
        });
      },
    });
  }
  return dbPromise;
};

// Helper function to get the database instance
const getDB = async () => {
  return await initDB();
};
// Validate store name
const isValidStore = (storeName: string): boolean => OBJECT_STORES.includes(storeName);

// Add compression utility function
export const decompressResponse = async (response: Response) => {
  const data = await response.json();

  // Check if the response was compressed with compress-json
  const compressionType = response.headers.get('X-Compression');

  if (compressionType === 'compress-json') {
    try {
      return compressJson.decompress(data);
    } catch (error) {
      console.warn('Failed to decompress response, using as-is:', error);
      return data;
    }
  }

  return data;
};

// Add an item to a specific store
export const addItem = async (storeName: string, item: any): Promise<any> => {
  const db = await getDB();
  return db.put(storeName, item);
};

// Get all items from a specific store
export const getItems = async (storeName: string): Promise<any> => {
  if (!isValidStore(storeName)) {
    console.warn(`Invalid object store name: ${storeName}`);
    return [];
  }
  try {
    const db = await getDB();
    return await db.getAll(storeName);
  } catch (error) {
    console.error(`Error getting items from ${storeName}:`, error);
    return [];
  }
};

// Get a single item by its ID
export const getItem = async (storeName: string, id: number): Promise<any> => {
  try {
    const db = await getDB();
    return await db.get(storeName, id);
  } catch (error) {
    console.error(`Error getting item ${id} from ${storeName}:`, error);
    return null;
  }
};

// Delete an item by its ID
export const deleteItem = async (storeName: string, id: number): Promise<void> => {
  try {
    const db = await getDB();
    await db.delete(storeName, id);
  } catch (error) {
    console.error(`Error deleting item ${id} from ${storeName}:`, error);
  }
};

export const bulkAddItems = async (storeName: string, items: any, clearStore: boolean = true) => {
  if (!isValidStore(storeName)) {
    console.warn(`Invalid object store name: ${storeName}`);
    return;
  }

  try {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    if (clearStore) {
      await store.clear();
    }

    // Defensive handling: allow passing the whole paginated payload
    // e.g., { data: [...], pagination: {...} }
    if (items == null) {
      await tx.done;
      return;
    }

    // If caller passed a sentinel string (e.g. '__PROCESSED_FROM_IDB__'), ignore
    if (typeof items === 'string') {
      await tx.done;
      return;
    }

    // If an object with .data array was provided, use that array
    if (!Array.isArray(items) && typeof items === 'object' && items.data && Array.isArray(items.data)) {
      // eslint-disable-next-line no-param-reassign
      items = items.data;
    }

    // If a single object was passed, wrap it to store as one record
    if (!Array.isArray(items)) {
      items = [items];
    }

    const BATCH_SIZE = 2000;
    let successCount = 0;
    let failureCount = 0;

    // Commit in batches: each batch opens its own transaction so the browser
    // doesn't keep a single giant transaction alive for 100k+ records.
    await tx.done; // close the initial (possibly clear-only) transaction first

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const batchTx = db.transaction(storeName, 'readwrite');
      const batchStore = batchTx.objectStore(storeName);

      const results = await Promise.allSettled(
        batch.map((originalItem: any) => batchStore.put(Object.assign({}, originalItem))),
      );

      await batchTx.done;

      for (const r of results) {
        if (r.status === 'fulfilled') successCount++;
        else {
          failureCount++;
          console.warn(`Failed to put item into ${storeName}:`, r.reason);
        }
      }
    }

    console.info(`bulkAddItems summary for store ${storeName}: attempted=${successCount + failureCount}, success=${successCount}, failure=${failureCount}`);
  } catch (error) {
    console.error(`Error bulk adding items to ${storeName}:`, error);
  }
};

export const hasItems = async (storeName: string): Promise<boolean> => {
  const db = await getDB();
  const count = await db.count(storeName);
  return count > 0;
};

export const filterItems = async (
  storeName: string,
  travel?: string,
  startDate?: number,
  endDate?: number,
): Promise<any[]> => {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    // Use composite travelDateIndex for styphi (travel + date range)
    if (storeName === 'styphi' && travel !== undefined) {
      let index: any;
      try {
        index = store.index('travelDateIndex');
      } catch (_e) {
        // Older DB version without index — fall through to date scan below
      }
      if (index) {
        const range =
          startDate !== undefined && endDate !== undefined
            ? IDBKeyRange.bound([travel, startDate], [travel, endDate])
            : undefined;
        const results: any[] = [];
        for await (const cursor of index.iterate(range)) {
          results.push(cursor.value);
        }
        return results;
      }
    }

    // Use dateIndex for all organism stores when filtering by date range
    if (startDate !== undefined && endDate !== undefined) {
      let index: any;
      try {
        index = store.index('dateIndex');
      } catch (_e) {
        // Older DB version without index — fall through to full scan
      }
      if (index) {
        const range = IDBKeyRange.bound(startDate, endDate);
        const results: any[] = [];
        for await (const cursor of index.iterate(range)) {
          // Apply in-memory travel filter if needed (only styphi has TRAVEL field)
          if (travel === undefined || cursor.value?.TRAVEL === travel) {
            results.push(cursor.value);
          }
        }
        return results;
      }
    }

    // Final fallback: full table scan (no indexes available or no filters applied)
    const all: any[] = await store.getAll();
    return all.filter(item => {
      const dateOk =
        startDate !== undefined && endDate !== undefined ? item?.DATE >= startDate && item?.DATE <= endDate : true;
      const travelOk = travel !== undefined ? item?.TRAVEL === travel : true;
      return dateOk && travelOk;
    });
  } catch (error) {
    console.error('Error filtering items:', error);
    return [];
  }
};
