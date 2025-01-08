import z from 'zod';
import {
  groupIdSchema,
  invitedUserIdSchema,
  userIdSchema,
} from '../utils/branded-types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LedgerEntrySchema = z.object({
  id: z.number(),
  groupId: groupIdSchema,
  title: z.string(),
  amount: z.number(),
  split: z.array(
    z.union([
      z.object({
        invitedUserId: invitedUserIdSchema,
        amount: z.number(),
        currency: z.string(),
      }),
      z.object({
        userId: userIdSchema,
        amount: z.number(),
        currency: z.string(),
      }),
    ]),
  ),
  spentBy: z.array(
    z.union([
      z.object({
        invitedUserId: invitedUserIdSchema,
        amount: z.number(),
        currency: z.string(),
      }),
      z.object({
        userId: userIdSchema,
        amount: z.number(),
        currency: z.string(),
      }),
    ]),
  ),
  date: z.date(),
});

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;
