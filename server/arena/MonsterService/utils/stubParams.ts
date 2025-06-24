import type { MonsterParams } from '@/arena/MonsterService/MonsterService';
import { CharModel } from '@/models/character';
import { ClanModel } from '@/models/clan';

export const stubParams = (params: MonsterParams) => {
  const char = new CharModel({ ...params, owner: 'monsters' });
  const clan = new ClanModel({ owner: char.id, name: 'Монстры' });

  char.clan = clan;

  return char;
};
