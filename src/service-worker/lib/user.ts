import { z } from 'zod';
import { dbPromise } from './db';
import { kvStoreItem } from './kv-store';
import { nanoid } from 'nanoid';
import { HTTPException } from 'hono/http-exception';
import { brandedIdSchema, formDataToObject } from '../utils/utils';

const userIdSchema = brandedIdSchema('UserId');
export type UserId = z.infer<typeof userIdSchema>;

const userKeySchema = brandedIdSchema('UserKey');
export type UserKey = z.infer<typeof userKeySchema>;

const currentUser = kvStoreItem(
  'currentUser',
  z
    .object({
      id: userIdSchema,
      key: userKeySchema,
      name: z.string().min(1),
      currencyCode: z.string(),
      createdOn: z.date(),
      modifiedOn: z.date(),
    })
    .strict(),
);

export const getCurrentUser = currentUser.get;

const userPartialSchema = currentUser.schema.pick({
  name: true,
  currencyCode: true,
});

export const createUser = async (formData: FormData) => {
  if (await getCurrentUser()) {
    throw new HTTPException(409, { message: 'User already exists' });
  }

  const userPartial = userPartialSchema.parse(formDataToObject(formData));

  const user = currentUser.schema.parse({
    id: userIdSchema.parse(nanoid()),
    key: userKeySchema.parse(nanoid()),
    ...userPartial,
    createdOn: new Date(),
    modifiedOn: new Date(),
  });

  const db = await dbPromise;
  await db.put('kvStore', user, 'currentUser');
  return user;
};

export const updateUser = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) throw new HTTPException(404, { message: 'User not found' });

  const userPartial = userPartialSchema.parse(formDataToObject(formData));

  const updatedUser = {
    ...user,
    ...userPartial,
    modifiedOn: new Date(),
  };

  const db = await dbPromise;
  await db.put('kvStore', updatedUser, 'currentUser');
  return updatedUser;
};
