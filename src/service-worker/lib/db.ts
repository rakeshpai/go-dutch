import { DBSchema, openDB } from 'idb';

interface AppDB extends DBSchema {
  kvStore: {
    key: string;
    value: unknown;
    indexes: { 'by-key': string };
  };
}

export const dbPromise = openDB<AppDB>('app-db', 1, {
  upgrade(database, oldVersion) {
    switch (oldVersion) {
      case 0: {
        const kvStore = database.createObjectStore('kvStore');
        kvStore.createIndex('by-key', 'key', { unique: true });
      }
    }
  },
});
