import z from 'zod';
import {
  groupIdSchema,
  GroupUserId,
  groupUserIdSchema,
  ledgerIdSchema,
} from '../utils/branded-types';
import { nanoid } from 'nanoid';
import { registerMutation } from './mutations';
import { requireUser } from './user';
import { throwIfNullish } from '../utils/utils';
import { Group } from './groups';

const amountByUserSchema = z.object({
  groupUserId: groupUserIdSchema,
  amount: z.number(),
  currency: z.string(),
});
const ledgerEntrySchema = z.object({
  id: ledgerIdSchema,
  groupId: groupIdSchema,
  title: z.string().trim().min(1),
  split: z.array(amountByUserSchema),
  spentBy: z.array(amountByUserSchema),
  createdBy: groupUserIdSchema,
  createdOn: z.date(),
  lastModifiedBy: groupUserIdSchema,
  modifiedOn: z.date(),
});

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

const createLedgerEntrySchema = z.object({
  groupId: groupIdSchema,
  title: ledgerEntrySchema.shape.title,
  split: ledgerEntrySchema.shape.split,
  spentBy: ledgerEntrySchema.shape.spentBy,
});

const usersInLedgerEntry = ({
  spentBy,
  split,
}: Pick<LedgerEntry, 'spentBy' | 'split'>) => {
  return new Set<GroupUserId>([...spentBy, ...split].map(s => s.groupUserId));
};

type CreateLedgerEntryMutationProps = {
  id: LedgerEntry['id'];
  ledgerEntry: z.infer<typeof createLedgerEntrySchema>;
  date: Date;
};

const createLedgerEntryMutation = registerMutation(
  'ledger-entry:create',
  ['ledger', 'groups', 'kvStore'],
  async (
    txn,
    {
      ledgerEntry: { groupId, spentBy, split, title },
      id,
      date,
    }: CreateLedgerEntryMutationProps,
  ) => {
    const [user, group] = await Promise.all([
      requireUser(txn),
      txn.objectStore('groups').get(groupId),
    ]);
    throwIfNullish(group, 'Invalid group ID');

    const userInGroup = group.users.find(u => u.userId === user.id);
    const groupUserId =
      userInGroup?.groupUserId || groupUserIdSchema.parse(nanoid());

    const usersInEntry = usersInLedgerEntry({ spentBy, split });

    const updatedGroup = {
      ...group,
      users: [
        ...group.users,
        ...(userInGroup
          ? []
          : [
              {
                groupUserId,
                userId: user.id,
                joinedOn: date,
                isInLedger: true,
                name: user.name,
              },
            ]),
      ].map(u => ({
        ...u,
        isInLedger: usersInEntry.has(u.groupUserId) ? true : u.isInLedger,
      })),
    } satisfies Group;

    await Promise.all([
      txn.objectStore('groups').put(updatedGroup),
      txn.objectStore('ledger').add({
        id,
        createdBy: groupUserId,
        createdOn: date,
        groupId,
        lastModifiedBy: groupUserId,
        modifiedOn: date,
        spentBy,
        split,
        title,
      }),
    ]);

    return id;
  },
);

export const createLedgerEntry = async (
  ledgerEntryPartial: z.infer<typeof createLedgerEntrySchema>,
) => {
  return createLedgerEntryMutation({
    ledgerEntry: createLedgerEntrySchema.parse(ledgerEntryPartial),
    date: new Date(),
    id: ledgerIdSchema.parse(nanoid()),
  });
};

// export const modifyLedgerEntry = registerMutation(
//   'ledger-entry:modify',
//   ['ledger', 'groups', 'kvStore'],
//   async (
//     txn,
//     {
//       ledgerEntryId,
//       title,
//       split,
//       spentBy,
//     }: {
//       ledgerEntryId: LedgerId;
//       title?: string;
//       split?: LedgerEntry['split'];
//       spentBy?: LedgerEntry['spentBy'];
//     },
//   ) => {
//     const [user, ledgerEntry] = await Promise.all([
//       requireUser(txn),
//       txn.objectStore('ledger').get(ledgerEntryId),
//     ]);
//     throwIfNullish(ledgerEntry, 'Ledger entry not found');

//     const group = await txn.objectStore('groups').get(ledgerEntry.groupId);

//     const newLedgerEntry: LedgerEntry = {
//       ...ledgerEntry,
//       title: title ?? ledgerEntry.title,
//       split: split ?? ledgerEntry.split,
//       spentBy: spentBy ?? ledgerEntry.spentBy,
//       modifiedOn: new Date(),
//       lastModifiedBy: user.id,
//     };

//     return txn
//       .objectStore('ledger')
//       .put(ledgerEntrySchema.parse(newLedgerEntry));
//   },
// );
