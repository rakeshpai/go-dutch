import { IDBPTransaction, StoreNames } from 'idb';
import { AppDB, dbPromise } from './db';
import { nanoid } from 'nanoid';

export const registerMutation = <S extends StoreNames<AppDB>[], T, R>(
  eventName: string,
  storeNames: S,
  handler: (txn: IDBPTransaction<AppDB, S, 'readwrite'>, args: T) => R,
) => {
  const mutate = async (args: T): Promise<Awaited<R>> => {
    const db = await dbPromise;
    const txn = db.transaction(['syncLog', ...storeNames], 'readwrite');
    const [result] = await Promise.all([
      handler(txn, args),
      txn.objectStore('syncLog').add({
        id: nanoid(),
        loggedAt: new Date(),
        type: eventName,
        args,
      }),
      txn.done,
    ]);
    return result;
  };
  return mutate;
};
