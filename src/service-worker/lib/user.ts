import { z } from 'zod';
import { kvStoreItem } from './kv-store';
import { nanoid } from 'nanoid';
import { HTTPException } from 'hono/http-exception';
import { userIdSchema, userKeySchema } from '../utils/branded-types';
import { registerMutation } from './mutations';
import { TransactionFor } from './db';
import { throwIfNullish } from '../utils/utils';

const currentUser = kvStoreItem(
  'currentUser',
  z
    .object({
      id: userIdSchema,
      key: userKeySchema,
      name: z.string().trim().min(1),
      currencyCode: z.string(),
      createdOn: z.date(),
      modifiedOn: z.date(),
    })
    .strict(),
);

export type CurrentUser = z.infer<typeof currentUser.schema>;

export const getCurrentUser = currentUser.get;
export const requireUser = async (
  txn?: TransactionFor<'kvStore', 'readonly'>,
) => {
  const user = await getCurrentUser(txn);
  throwIfNullish(user, 'User not found');
  return user;
};

export const userPartialSchema = currentUser.schema.pick({
  name: true,
  currencyCode: true,
});

const createUserMutation = registerMutation(
  'user:create',
  ['kvStore'],
  (txn, { user }: { user: CurrentUser }) => {
    return currentUser.set(user, txn);
  },
);

export const createUser = async (
  userPartial: z.infer<typeof userPartialSchema>,
) => {
  if (await getCurrentUser()) {
    throw new HTTPException(409, { message: 'User already exists' });
  }

  const user: CurrentUser = {
    id: userIdSchema.parse(nanoid()),
    key: userKeySchema.parse(nanoid()),
    ...userPartial,
    createdOn: new Date(),
    modifiedOn: new Date(),
  };

  await createUserMutation({ user: currentUser.schema.parse(user) });
  return user;
};

export const updateUser = registerMutation(
  'user:update',
  ['kvStore'],
  async (txn, userPartial: z.infer<typeof userPartialSchema>) => {
    const user = await requireUser(txn);

    const updatedUser: CurrentUser = {
      ...user,
      ...userPartial,
      modifiedOn: new Date(),
    };

    await currentUser.set(currentUser.schema.parse(updatedUser), txn);
    return updatedUser;
  },
);
