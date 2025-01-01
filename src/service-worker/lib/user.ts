import { dbPromise } from './db';
import { z } from 'zod';

const User = z.object({
  name: z.string(),
});

export const getCurrentUser = async () => {
  try {
    const db = await dbPromise;
    const user = await db.get('kvStore', 'currentUser');
    return user ? User.parse(user) : undefined;
  } catch (e) {
    console.log(e);
  }
};

export const setCurrentUser = async (user: z.infer<typeof User>) => {
  const db = await dbPromise;
  return db.put('kvStore', user, 'currentUser');
};
