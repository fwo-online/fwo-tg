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
  maxPlayers: number;
  forge: {
    active: boolean;
    expiresAt: string | null;
  };
};

export type ClanPublic = Pick<Clan, 'id' | 'name' | 'players' | 'owner'>;

export const createClanSchema = v.object({
  name: nameSchema,
});

export const clanLvlCost = [100, 250, 750, 1500];
export const clanAcceptCostPerLvl = 50;
export const clanForgeCost = 1500;
