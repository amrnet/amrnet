import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { addItem, deleteItem, getItem, getItems, bulkAddItems, hasItems, filterItems, initDB } from '../idb';

// Define the shape of the context value
interface IndexedDBContextType {
  dbInitialized: boolean;
  addItem: typeof addItem;
  getItem: typeof getItem;
  getItems: typeof getItems;
  deleteItem: typeof deleteItem;
  bulkAddItems: typeof bulkAddItems;
  hasItems: typeof hasItems;
  filterItems: typeof filterItems;
}

// Create a context with a default value of undefined
const IndexedDBContext = createContext<IndexedDBContextType | undefined>(undefined);

interface IndexedDBProviderProps {
  children: ReactNode;
}

export const IndexedDBProvider: FC<IndexedDBProviderProps> = ({ children }) => {
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initializeDB = async () => {
      await initDB();
      setDbInitialized(true);
    };

    initializeDB();
  }, []);

  return (
    <IndexedDBContext.Provider
      value={{ dbInitialized, addItem, getItem, getItems, deleteItem, bulkAddItems, hasItems, filterItems }}
    >
      {children}
    </IndexedDBContext.Provider>
  );
};

// Custom hook to use the IndexedDB context
export const useIndexedDB = (): IndexedDBContextType => {
  const context = useContext(IndexedDBContext);
  if (!context) {
    throw new Error('useIndexedDB must be used within an IndexedDBProvider');
  }
  return context;
};
