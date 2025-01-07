import { z } from 'zod';
import { dbPromise, TransactionFor } from './db';

export const kvStoreItem = <T extends z.ZodTypeAny>(
  key: string,
  zodSchema: T,
) => {
  return {
    get: async (
      txn?: TransactionFor<'kvStore', 'readonly'>,
    ): Promise<z.infer<T> | undefined> => {
      const valuePromise = txn
        ? txn.objectStore('kvStore').get(key)
        : dbPromise.then(db => db.get('kvStore', key));

      const value = await valuePromise;
      return value ? zodSchema.parse(value) : undefined;
    },
    set: async (
      value: z.infer<T>,
      txn?: TransactionFor<'kvStore', 'readwrite'>,
    ) => {
      if (txn) {
        return txn.objectStore('kvStore').put(value, key);
      }

      const db = await dbPromise;
      return db.put('kvStore', value, key);
    },
    delete: async (txn?: TransactionFor<'kvStore', 'readwrite'>) => {
      if (txn) {
        return txn.objectStore('kvStore').delete(key);
      }
      const db = await dbPromise;
      return db.delete('kvStore', key);
    },
    schema: zodSchema,
  };
};
