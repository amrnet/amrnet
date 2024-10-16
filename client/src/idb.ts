import { openDB } from 'idb';

type OrganismStore = 'styphi' | 'kpneumo' | 'ngono' | 'ecoli' | 'decoli' | 'shige' | 'sentericaints' | 'senterica';

const DB_NAME = 'organismsData';
const DB_VERSION = 11;

const OBJECT_STORES = [
  'styphi',
  'kpneumo',
  'ngono',
  'ecoli',
  'decoli',
  'shige',
  'sentericaints',
  'senterica',
  'styphi_sets',
  'styphi_map',
  'styphi_genotype',
  'styphi_years',
  'kpneumo_map',
  'kpneumo_genotype',
  'kpneumo_years',
  'kpneumo_ko',
  'kpneumo_convergence',
  'ngono_map',
  'ngono_genotype',
  'ngono_ngmast',
  'ngono_years',
  'ecoli_map',
  'ecoli_genotype',
  'ecoli_years',
  'decoli_map',
  'decoli_genotype',
  'decoli_years',
  'shige_map',
  'shige_genotype',
  'shige_years',
  'sentericaints_map',
  'sentericaints_genotype',
  'sentericaints_years',
  'senterica_map',
  'senterica_genotype',
  'senterica_years',
];

// Initialize the database
export const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Convert db.objectStoreNames to an array so it can be iterated
      const currentStores = Array.from(db.objectStoreNames);

      // Remove stores that are no longer in the OBJECT_STORES array
      currentStores.forEach((storeName) => {
        if (!OBJECT_STORES.includes(storeName)) {
          db.deleteObjectStore(storeName);
        }
      });

      // Add new stores that are in the OBJECT_STORES array but not in the database
      OBJECT_STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
        }
      });
    },
  });
};

// Helper function to get the object store
const getStore = async (storeName: OrganismStore) => {
  const db = await initDB();
  return db.transaction(storeName, 'readwrite').objectStore(storeName);
};

// Add an item to a specific store
export const addItem = async (storeName: OrganismStore, item: any): Promise<IDBValidKey> => {
  const store = await getStore(storeName);
  return store.put(item);
};

// Get all items from a specific store
export const getItems = async (storeName: OrganismStore): Promise<any> => {
  const store = await getStore(storeName);
  return store.getAll();
};

// Get a single item by its ID
export const getItem = async (storeName: OrganismStore, id: number): Promise<any> => {
  const store = await getStore(storeName);
  return store.get(id);
};

// Delete an item by its ID
export const deleteItem = async (storeName: OrganismStore, id: number): Promise<void> => {
  const store = await getStore(storeName);
  return store.delete(id);
};

export const bulkAddItems = async (storeName: OrganismStore, items: Array<any>, clearStore: boolean = true) => {
  const store = await getStore(storeName);

  // Start a transaction for the specified store
  const tx = store.transaction;

  // Clear all existing data from the store
  if (clearStore) {
    await store.clear();
  }

  // Add all items in the transaction
  items.forEach((item) => {
    store.put(item); // Use put instead of add
  });

  // Complete the transaction
  await tx.done;
};

export const hasItems = async (storeName: OrganismStore): Promise<boolean> => {
  const store = await getStore(storeName);

  // Use count to determine if there are any items
  const count = await store.count();
  return count > 0;
};

export const filterItems = async (
  storeName: OrganismStore,
  travel?: string,
  startDate?: number,
  endDate?: number,
): Promise<any[]> => {
  try {
    const store = await getStore(storeName);
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
      range = IDBKeyRange.lowerBound([null]);
    }

    // Open cursor on the composite index with the range
    const cursorRequest = index.openCursor(range);
    const results: any[] = [];

    // Await the cursor request
    let currentCursor = await cursorRequest;
    while (currentCursor) {
      results.push(currentCursor.value);
      currentCursor = await cursorRequest;
    }

    return results;
  } catch (error) {
    console.error('Error filtering items:', error);
    throw error;
  }
};
