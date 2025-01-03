import { z } from 'zod';
import { dbPromise } from './db';

export const kvStoreItem = <T extends z.ZodTypeAny>(
  key: string,
  zodSchema: T,
) => {
  return {
    get: async (): Promise<z.infer<T> | undefined> => {
      const db = await dbPromise;
      const value = await db.get('kvStore', key);
      return value ? zodSchema.parse(value) : undefined;
    },
    set: async (value: z.infer<T>) => {
      const db = await dbPromise;
      return db.put('kvStore', value, key);
    },
    delete: async () => {
      const db = await dbPromise;
      return db.delete('kvStore', key);
    },
    schema: zodSchema,
  };
};
