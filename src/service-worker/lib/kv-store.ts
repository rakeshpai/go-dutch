import { z } from 'zod';
import { AppDB, dbPromise } from './db';
import { IDBPTransaction } from 'idb';

type WriteableTransaction = IDBPTransaction<AppDB, ['kvStore'], 'readwrite'>;

export const kvStoreItem = <T extends z.ZodTypeAny>(
  key: string,
  zodSchema: T,
) => {
  return {
    get: async (
      txn?: IDBPTransaction<AppDB>,
    ): Promise<z.infer<T> | undefined> => {
      const valuePromise = txn
        ? txn.objectStore('kvStore').get(key)
        : dbPromise.then(db => db.get('kvStore', key));

      const value = await valuePromise;
      return value ? zodSchema.parse(value) : undefined;
    },
    set: async (value: z.infer<T>, txn?: WriteableTransaction) => {
      if (txn) {
        return txn.objectStore('kvStore').put(value, key);
      }

      const db = await dbPromise;
      return db.put('kvStore', value, key);
    },
    delete: async (txn?: WriteableTransaction) => {
      if (txn) {
        txn.objectStore('kvStore').delete(key);
      }
      const db = await dbPromise;
      return db.delete('kvStore', key);
    },
    schema: zodSchema,
  };
};
