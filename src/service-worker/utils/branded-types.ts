import { z } from 'zod';

const brandedIdSchema = <T extends string>(brand: T) =>
  z.string().nanoid().brand(brand);

export const userIdSchema = brandedIdSchema('UserId');
export type UserId = z.infer<typeof userIdSchema>;

export const userKeySchema = brandedIdSchema('UserKey');
export type UserKey = z.infer<typeof userKeySchema>;

export const groupIdSchema = brandedIdSchema('GroupId');
export type GroupId = z.infer<typeof groupIdSchema>;

export const groupKeySchema = brandedIdSchema('GroupKey');
export type GroupKey = z.infer<typeof groupKeySchema>;

export const groupUserIdSchema = brandedIdSchema('GroupUserId');
export type GroupUserId = z.infer<typeof groupUserIdSchema>;

export const ledgerIdSchema = brandedIdSchema('LedgerId');
export type LedgerId = z.infer<typeof ledgerIdSchema>;
