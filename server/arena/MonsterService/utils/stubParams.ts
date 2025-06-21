import type { MonsterParams } from '@/arena/MonsterService/MonsterService';
import { CharModel } from '@/models/character';
import { ClanModel } from '@/models/clan';

export const stubParams = async (params: MonsterParams) => {
  const char = await CharModel.create({ ...params, owner: params.id });
  const clan = await ClanModel.create({ owner: char.id, name: 'Монстры' });

  char.clan = clan;

  return char;
};
