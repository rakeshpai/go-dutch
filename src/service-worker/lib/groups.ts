import { z } from 'zod';
import {
  GroupId,
  groupIdSchema,
  GroupKey,
  groupKeySchema,
  groupUserIdSchema,
  ledgerIdSchema,
  userIdSchema,
} from '../utils/branded-types';
import { nanoid } from 'nanoid';
import { dbPromise, TransactionFor } from './db';
import { requireUser } from './user';
import { registerMutation } from './mutations';
import { throwIfNullish } from '../utils/utils';

const groupSchema = z.object({
  id: groupIdSchema,
  key: groupKeySchema,
  name: z.string().trim().min(1),
  coverColor: z.string().optional(),
  createdBy: groupUserIdSchema,
  createdOn: z.date(),
  lastModifiedBy: groupUserIdSchema,
  modifiedOn: z.date(),
  users: z.array(
    z.object({
      groupUserId: groupUserIdSchema,
      userId: userIdSchema.optional(),
      name: z.string(),
      joinedOn: z.date().optional(),
      isInLedger: z.boolean().optional(),
    }),
  ),
  ledgers: z.array(ledgerIdSchema),
});

export type Group = z.infer<typeof groupSchema>;

export const getGroup = (
  id: GroupId,
  txn?: TransactionFor<'groups', 'readonly'>,
) => {
  return txn
    ? txn.objectStore('groups').get(id)
    : dbPromise.then(db => db.get('groups', id));
};

export const getGroups = async () => {
  const db = await dbPromise;
  return db.getAll('groups');
};

export const groupCount = async () => {
  const db = await dbPromise;
  return db.count('groups');
};

const createGroupMutation = registerMutation(
  'group:create',
  ['groups'],
  async (txn, { group }: { group: Group }) => {
    return txn.objectStore('groups').add(group);
  },
);

export const createGroupSchema = z.object({
  name: z.string().min(1),
  people: z
    .array(z.object({ name: z.string().min(1), id: groupUserIdSchema }))
    .optional(),
  coverColor: z.string().optional(),
});

export const createGroup = async ({
  name,
  coverColor,
  people = [],
}: z.infer<typeof createGroupSchema>) => {
  const user = await requireUser();
  const groupUserId = groupUserIdSchema.parse(nanoid());

  const group: Group = {
    id: groupIdSchema.parse(nanoid()),
    key: groupKeySchema.parse(nanoid()),
    name: name,
    coverColor,
    createdBy: groupUserId,
    createdOn: new Date(),
    lastModifiedBy: groupUserId,
    modifiedOn: new Date(),
    users: [
      {
        groupUserId,
        userId: user.id,
        name: user.name,
        joinedOn: new Date(),
      },
      ...people.map(p => ({
        groupUserId: p.id,
        name: p.name,
      })),
    ],
    ledgers: [],
  };

  await createGroupMutation({ group: groupSchema.parse(group) });
  return group;
};

export const claimInvitationSchema = z.object({
  groupId: groupIdSchema,
  groupUserId: groupUserIdSchema,
});

export const claimInvitation = registerMutation(
  'group:claim-mutation',
  ['groups', 'kvStore'],
  async (
    txn,
    { groupId, groupUserId }: z.infer<typeof claimInvitationSchema>,
  ) => {
    const [user, group] = await Promise.all([
      requireUser(txn),
      getGroup(groupId, txn),
    ]);
    throwIfNullish(group, 'Group not found');

    const matchingGroupUser = group.users.find(u => u.groupUserId);
    throwIfNullish(matchingGroupUser, 'The invitation is invalid');

    if (matchingGroupUser.userId === user.id) return; // Everything's already done

    const updatedGroup: Group = {
      ...group,
      users: group.users.map(u => {
        if (u.groupUserId !== groupUserId) return u;
        return { ...u, userId: user.id, joinedOn: new Date() };
      }),
      modifiedOn: new Date(),
    };

    return txn
      .objectStore('groups')
      .put(groupSchema.parse(updatedGroup), groupId);
  },
);

export const deletableUsers = async (groupId: GroupId) => {
  const db = await dbPromise;
  const txn = db.transaction(['groups', 'ledger'], 'readonly');
  const group = await txn.objectStore('groups').get(groupId);
  throwIfNullish(group, 'Group not found');

  const deletableUsers = new Set(group.users.map(u => u.groupUserId));

  const cursor = await txn
    .objectStore('ledger')
    .index('by-group-and-date')
    .openCursor([groupId, new Date('1970-01-01')]);

  if (!cursor) throw new Error('Error getting a cursor');

  for await (const ledgerEntry of cursor) {
    ledgerEntry.value.spentBy.forEach(u =>
      deletableUsers.delete(u.groupUserId),
    );
    ledgerEntry.value.split.forEach(u => deletableUsers.delete(u.groupUserId));

    if (deletableUsers.size === 0) break;
  }

  return deletableUsers;
};

export const syncGroup = async (groupId: GroupId, key: GroupKey) => {
  // Get the group from remote and decript it with the key
  // Then fetch the ledgers and store them locally
  console.log('Syncing group', groupId, key);
  console.log('Syncing ledger', /* ledgerId,*/ key);
};
