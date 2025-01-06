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
import { dbPromise } from './db';
import { getCurrentUser } from './user';
import { HTTPException } from 'hono/http-exception';
import { registerMutation } from './mutations';

const groupSchema = z.object({
  id: groupIdSchema,
  key: groupKeySchema,
  name: z.string().min(1),
  coverColor: z.string().optional(),
  createdBy: z.object({ id: userIdSchema, name: z.string() }),
  createdOn: z.date(),
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

export const getGroup = (id: GroupId) => {
  return dbPromise.then(db => db.get('groups', id));
};

export const getGroups = async () => {
  const db = await dbPromise;
  return db.getAll('groups');
};

const createGroupMutation = registerMutation(
  'create-group',
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
  const user = await getCurrentUser();
  if (!user) throw new HTTPException(401, { message: 'Not logged in' });

  const group: Group = {
    id: groupIdSchema.parse(nanoid()),
    key: groupKeySchema.parse(nanoid()),
    name: name,
    coverColor,
    createdOn: new Date(),
    modifiedOn: new Date(),
    pendingInvitations: people.map(name => ({
      id: invitedUserIdSchema.parse(nanoid()),
      name,
    })),
    createdBy: { id: user.id, name: user.name },
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
  'claim-mutation',
  ['groups', 'kvStore'],
  async (
    txn,
    { groupId, invitedUserId }: z.infer<typeof claimInvitationSchema>,
  ) => {
    const user = await getCurrentUser(txn);
    if (!user) {
      throw new HTTPException(401, { message: 'Not logged in' });
    }

    const group = await txn.objectStore('groups').get(groupId);
    if (!group) {
      txn.abort();
      throw new HTTPException(404, { message: 'Group not found' });
    }

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
