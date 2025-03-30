import { nameSchema } from '@/shared';
import * as v from 'valibot';

export const reservedClanName = '__clan';

export type Clan = {
  id: string;
  name: string;
  gold: number;
  lvl: number;
  owner: string;
  players: string[];
  requests: string[];
  hasEmptySlot: boolean;
};

export const createClanSchema = v.object({
  name: nameSchema,
});
