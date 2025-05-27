import type { MonsterParams } from '@/arena/MonsterService/MonsterService';
import type { Char } from '@/models/character';
import { CharacterClass } from '@fwo/shared';
import { Types } from 'mongoose';

export const stubParams = (params: MonsterParams) =>
  ({
    ...params,
    _id: new Types.ObjectId(),
    owner: params.id,
    birthday: new Date(),
    prof: CharacterClass.Warrior,
    exp: 0,
    gold: 0,
    psr: 0,
    free: 0,
    bonus: 0,
    sex: 'm',
    penalty: [],
    expLimit: { earn: 0, expiresAt: new Date() },
    deleted: false,
    components: new Map(),
    lastFight: null,
    statistics: {
      games: 0,
      kills: 0,
      death: 0,
      runs: 0,
      wins: 0,
    },
  }) satisfies Char;
