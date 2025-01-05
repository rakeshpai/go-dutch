import { z } from 'zod';
import {
  GroupId,
  groupIdSchema,
  GroupKey,
  groupKeySchema,
  InvitedUserId,
  invitedUserIdSchema,
  ledgerIdSchema,
  userIdSchema,
} from '../utils/branded-types';
import { nanoid } from 'nanoid';
import { dbPromise } from './db';
import { getCurrentUser } from './user';
import { HTTPException } from 'hono/http-exception';

const groupSchema = z.object({
  id: groupIdSchema,
  key: groupKeySchema,
  name: z.string().min(1),
  coverColor: z.string().optional(),
  createdOn: z.date(),
  modifiedOn: z.date(),
  pendingInvitations: z
    .array(
      z.object({
        id: invitedUserIdSchema,
        name: z.string(),
      }),
    )
    .optional()
    .default([]),
  confirmedUsers: z
    .array(
      z.object({
        invitedId: invitedUserIdSchema,
        userId: userIdSchema,
        name: z.string(),
        joinDate: z.date(),
      }),
    )
    .optional()
    .default([]),
  ledgers: z.array(ledgerIdSchema).optional().default([]),
});

export type Group = z.infer<typeof groupSchema>;

export const createGroupSchema = z.object({
  name: z.string().min(1),
  people: z.array(z.string().min(1)).optional(),
  coverColor: z.string().optional(),
});

export const createGroup = async ({
  name,
  people,
  coverColor,
}: z.infer<typeof createGroupSchema>) => {
  const group = groupSchema.parse({
    id: groupIdSchema.parse(nanoid()),
    key: groupKeySchema.parse(nanoid()),
    name: name,
    coverColor,
    createdOn: new Date(),
    modifiedOn: new Date(),
    pendingInvitations: people?.map(name => ({
      id: invitedUserIdSchema.parse(nanoid()),
      name,
    })),
  });

  const db = await dbPromise;
  await db.put('groups', group, group.id);
  return group;
};

export const getGroup = (id: GroupId) => {
  return dbPromise.then(db => db.get('groups', id));
};

export const getGroups = async () => {
  const db = await dbPromise;
  return db.getAll('groups');
};

export const syncGroup = async (groupId: GroupId, key: GroupKey) => {
  // Get the group from remote and decript it with the key
  // Then fetch the ledgers and store them locally
  console.log('Syncing group', groupId, key);
};

export const claimInvitation = async (
  groupId: GroupId,
  invitedUserId: InvitedUserId,
) => {
  const user = await getCurrentUser();
  if (!user) throw new HTTPException(401, { message: 'Not logged in' });

  const db = await dbPromise;

  const tx = db.transaction('groups', 'readwrite');

  const group = await tx.store.get(groupId);
  if (!group) {
    tx.abort();
    throw new HTTPException(404, { message: 'Group not found' });
  }

  const pendingInvitations = group.pendingInvitations.filter(invite => {
    return invite.id !== invitedUserId;
  });

  const userAlreadyConfirmed = Boolean(
    group.confirmedUsers.find(c => c.userId === user.id),
  );

  const confirmedUsers = userAlreadyConfirmed
    ? group.confirmedUsers
    : group.confirmedUsers.concat({
        invitedId: invitedUserId,
        userId: user.id,
        name: user.name,
        joinDate: new Date(),
      });

  const updatedGroup = groupSchema.parse({
    ...group,
    pendingInvitations,
    confirmedUsers,
    modifiedOn: new Date(),
  });

  await tx.store.put(updatedGroup, groupId);
  return tx.done;
};
