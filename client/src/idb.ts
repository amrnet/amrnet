import { openDB } from 'idb';

type OrganismStore = 'styphi' | 'kpneumo' | 'ngono' | 'ecoli' | 'decoli' | 'shige' | 'sentericaints' | 'senterica';

const DB_NAME = 'organismsData';
const DB_VERSION = 35;

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
  'ecoli_map',
  'ecoli_map_regions',
  'ecoli_genotype',
  'ecoli_years',
  'decoli_map',
  'decoli_map_regions',
  'decoli_genotype',
  'decoli_years',
  'shige_map',
  'shige_map_regions',
  'shige_genotype',
  'shige_years',
  'sentericaints_map',
  'sentericaints_map_regions',
  'sentericaints_genotype',
  'sentericaints_years',
  'senterica_map',
  'senterica_map_regions',
  'senterica_genotype',
  'senterica_years',
  'unr',
];

// Initialize the database (singleton pattern)
let dbPromise: ReturnType<typeof openDB> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Remove all existing object stores if needed (essentially clearing the cache)
        Array.from(db.objectStoreNames).forEach(storeName => {
          db.deleteObjectStore(storeName);
        });

        // Recreate object stores with the updated schema
        OBJECT_STORES.forEach(store => {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
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

// Add an item to a specific store
export const addItem = async (storeName: OrganismStore, item: any): Promise<IDBValidKey> => {
  const db = await getDB();
  return db.put(storeName, item);
};

const isValidStore = (storeName: string): boolean => OBJECT_STORES.includes(storeName);

// Get all items from a specific store
export const getItems = async (storeName: OrganismStore): Promise<any> => {
  if (!isValidStore(storeName)) {
    throw new Error(`Invalid object store name: ${storeName}`);
  }
  const db = await getDB();
  return db.getAll(storeName);
};

// Get a single item by its ID
export const getItem = async (storeName: OrganismStore, id: number): Promise<any> => {
  const db = await getDB();
  return db.get(storeName, id);
};

// Delete an item by its ID
export const deleteItem = async (storeName: OrganismStore, id: number): Promise<void> => {
  const db = await getDB();
  return db.delete(storeName, id);
};

export const bulkAddItems = async (storeName: OrganismStore, items: Array<any>, clearStore: boolean = true) => {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);

  if (clearStore) {
    await store.clear();
  }

  for (const item of items) {
    await store.put(item);
  }

  await tx.done;
};

export const hasItems = async (storeName: OrganismStore): Promise<boolean> => {
  const db = await getDB();
  const count = await db.count(storeName);
  return count > 0;
};

export const filterItems = async (
  storeName: OrganismStore,
  travel?: string,
  startDate?: number,
  endDate?: number,
): Promise<any[]> => {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index('travelDateIndex');

    let range: IDBKeyRange | undefined;

    if (travel !== undefined && startDate !== undefined && endDate !== undefined) {
      // Define the range for DATE with TRAVEL filter
      range = IDBKeyRange.bound([travel, startDate], [travel, endDate], false, false);
    } else if (startDate !== undefined && endDate !== undefined) {
      // Define the range for DATE without TRAVEL filter
      range = IDBKeyRange.bound([null, startDate], [null, endDate], true, false);
    } else {
      // If no DATE range is provided, return all items
      range = undefined;
    }

    const results: any[] = [];
    for await (const cursor of index.iterate(range)) {
      results.push(cursor.value);
    }

    return results;
  } catch (error) {
    console.error('Error filtering items:', error);
    throw error;
  }
};
