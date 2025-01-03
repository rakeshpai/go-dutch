import { dbPromise } from './db';
import { currentUser } from './kv-store';
import { nanoid } from 'nanoid';

const formDataToObject = (formData: FormData) => {
  return Object.fromEntries(formData.entries());
};

export const getCurrentUser = currentUser.get;

export const createUser = async (formData: FormData) => {
  const user = currentUser.schema
    .omit({ id: true, key: true })
    .parse(formDataToObject(formData));

  const db = await dbPromise;
  await db.put(
    'kvStore',
    { id: nanoid(), key: nanoid(), ...user },
    'currentUser',
  );
};
