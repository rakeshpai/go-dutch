import { z } from 'zod';
import { dbPromise } from './db';
import { kvStoreItem } from './kv-store';
import { nanoid } from 'nanoid';

const userIdSchema = z.string().nanoid().brand('UserId');
export type UserId = z.infer<typeof userIdSchema>;

const currentUser = kvStoreItem(
  'currentUser',
  z
    .object({
      id: userIdSchema,
      key: z.string().nanoid().brand('UserKey'),
      name: z.string().min(1),
      currencyCode: z.string(),
    })
    .strict(),
);

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
