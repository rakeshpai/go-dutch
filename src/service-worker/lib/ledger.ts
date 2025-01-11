import z from 'zod';
import {
  groupIdSchema,
  groupUserIdSchema,
  LedgerId,
  ledgerIdSchema,
  userIdSchema,
} from '../utils/branded-types';
import { nanoid } from 'nanoid';
import { registerMutation } from './mutations';
import { requireUser } from './user';
import { throwIfNullish } from '../utils/utils';

const amountByUserSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  groupUserId: groupUserIdSchema,
});
const ledgerEntrySchema = z.object({
  id: ledgerIdSchema,
  groupId: groupIdSchema,
  title: z.string().trim().min(1),
  split: z.array(amountByUserSchema),
  spentBy: z.array(amountByUserSchema),
  createdBy: z.object({ id: userIdSchema, name: z.string() }),
  createdOn: z.date(),
  lastModifiedBy: z.object({ id: userIdSchema, name: z.string() }),
  modifiedOn: z.date(),
});

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

const createLedgerEntryMutation = registerMutation(
  'ledger-entry:create',
  ['ledger'],
  (txn, ledgerEntry: z.infer<typeof ledgerEntrySchema>) => {
    return txn.objectStore('ledger').add(ledgerEntry);
  },
);

const createLedgerEntrySchema = z.object({
  groupId: groupIdSchema,
  title: ledgerEntrySchema.shape.title,
  split: ledgerEntrySchema.shape.split,
  spentBy: ledgerEntrySchema.shape.spentBy,
});

export const createLedgerEntry = async (
  ledgerEntry: z.infer<typeof createLedgerEntrySchema>,
) => {
  const user = await requireUser();

  return createLedgerEntryMutation({
    id: ledgerIdSchema.parse(nanoid()),
    ...createLedgerEntrySchema.parse(ledgerEntry),
    createdBy: { id: user.id, name: user.name },
    createdOn: new Date(),
    lastModifiedBy: { id: user.id, name: user.name },
    modifiedOn: new Date(),
  });
};

export const modifyLedgerEntry = registerMutation(
  'ledger-entry:modify',
  ['ledger'],
  async (
    txn,
    {
      ledgerEntryId,
      title,
      split,
      spentBy,
    }: {
      ledgerEntryId: LedgerId;
      title?: string;
      split?: LedgerEntry['split'];
      spentBy?: LedgerEntry['spentBy'];
    },
  ) => {
    const [user, ledgerEntry] = await Promise.all([
      requireUser(txn),
      txn.objectStore('ledger').get(ledgerEntryId),
    ]);
    throwIfNullish(ledgerEntry, 'Ledger entry not found');

    const newLedgerEntry: LedgerEntry = {
      ...ledgerEntry,
      title: title ?? ledgerEntry.title,
      split: split ?? ledgerEntry.split,
      spentBy: spentBy ?? ledgerEntry.spentBy,
      modifiedOn: new Date(),
      lastModifiedBy: { id: user.id, name: user.name },
    };

    return txn
      .objectStore('ledger')
      .put(ledgerEntrySchema.parse(newLedgerEntry));
  },
);
