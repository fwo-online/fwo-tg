import { Types } from 'mongoose';
import type { MonsterParams } from '@/arena/MonsterService/MonsterService';
import { CharModel } from '@/models/character';

export const stubParams = (params: MonsterParams) => {
  return new CharModel({ ...params, owner: new Types.ObjectId() });
};
