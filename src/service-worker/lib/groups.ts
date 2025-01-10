import { z } from 'zod';
import {
  GroupId,
  groupIdSchema,
  GroupKey,
  groupKeySchema,
  invitedUserIdSchema,
  ledgerIdSchema,
  userIdSchema,
} from '../utils/branded-types';
import { nanoid } from 'nanoid';
import { dbPromise, TransactionFor } from './db';
import { requireUser } from './user';
import { registerMutation } from './mutations';
import { throwIfUndefined } from '../utils/utils';

const groupSchema = z.object({
  id: groupIdSchema,
  key: groupKeySchema,
  name: z.string().trim().min(1),
  coverColor: z.string().optional(),
  createdBy: z.object({ id: userIdSchema, name: z.string() }),
  createdOn: z.date(),
  lastModifiedBy: z.object({ id: userIdSchema, name: z.string() }),
  modifiedOn: z.date(),
  pendingInvitations: z.array(
    z.object({
      id: invitedUserIdSchema,
      name: z.string(),
    }),
  ),
  confirmedUsers: z.array(
    z.object({
      invitedId: invitedUserIdSchema.optional(),
      userId: userIdSchema,
      name: z.string(),
      joinedOn: z.date(),
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
    return txn.objectStore('groups').add(group, group.id);
  },
);

export const createGroupSchema = z.object({
  name: z.string().min(1),
  people: z.array(z.string().min(1)).optional(),
  coverColor: z.string().optional(),
});

export const createGroup = async ({
  name,
  coverColor,
  people = [],
}: z.infer<typeof createGroupSchema>) => {
  const user = await requireUser();

  const group: Group = {
    id: groupIdSchema.parse(nanoid()),
    key: groupKeySchema.parse(nanoid()),
    name: name,
    coverColor,
    createdBy: { id: user.id, name: user.name },
    createdOn: new Date(),
    lastModifiedBy: { id: user.id, name: user.name },
    modifiedOn: new Date(),
    pendingInvitations: people.map(name => ({
      id: invitedUserIdSchema.parse(nanoid()),
      name,
    })),
    confirmedUsers: [
      {
        userId: user.id,
        name: user.name,
        joinedOn: new Date(),
      },
    ],
    ledgers: [],
  };

  await createGroupMutation({ group: groupSchema.parse(group) });
  return group;
};

export const claimInvitationSchema = z.object({
  groupId: groupIdSchema,
  invitedUserId: invitedUserIdSchema,
});

export const claimInvitation = registerMutation(
  'group:claim-mutation',
  ['groups', 'kvStore'],
  async (
    txn,
    { groupId, invitedUserId }: z.infer<typeof claimInvitationSchema>,
  ) => {
    const [user, group] = await Promise.all([
      requireUser(txn),
      getGroup(groupId, txn),
    ]);
    throwIfUndefined(group, 'Group not found');

    const userAlreadyConfirmed = Boolean(
      group.confirmedUsers.find(c => c.userId === user.id),
    );

    const updatedGroup: Group = {
      ...group,
      pendingInvitations: group.pendingInvitations.filter(invite => {
        return invite.id !== invitedUserId;
      }),
      confirmedUsers: userAlreadyConfirmed
        ? group.confirmedUsers
        : group.confirmedUsers.concat({
            invitedId: invitedUserId,
            userId: user.id,
            name: user.name,
            joinedOn: new Date(),
          }),
      modifiedOn: new Date(),
    };

    return txn
      .objectStore('groups')
      .put(groupSchema.parse(updatedGroup), groupId);
  },
);

export const syncGroup = async (groupId: GroupId, key: GroupKey) => {
  // Get the group from remote and decript it with the key
  // Then fetch the ledgers and store them locally
  console.log('Syncing group', groupId, key);
  console.log('Syncing ledger', /* ledgerId,*/ key);
};
