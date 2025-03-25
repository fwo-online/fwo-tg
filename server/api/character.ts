import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { Char } from '@/models/character';
import { CharModel } from '@/models/character';
import type { Clan } from '@/models/clan';
import { ItemModel, type Item } from '@/models/item';
import { ItemWear } from '@fwo/shared';
import ValidationError from '@/arena/errors/ValidationError';

export async function findCharacter(query: FilterQuery<Char>) {
  const character = await CharModel.findOne({ ...query, deleted: false })
    .orFail(new Error('Персонаж не найден'))
    .populate<{ items: Item[] }>('items')
    .populate<{ equipment: Map<ItemWear, Item> }>('equipment')
    .populate<{ clan: Clan }>('clan');

  const char = character.toObject({ minimize: false });

  return char;
}

export async function removeCharacter(_id?: string) {
  const character = await CharModel.findOneAndUpdate(
    { _id, deleted: false },
    { deleted: true },
  ).orFail(new Error('Персонаж не найден'));

  return character.deleted;
}

export async function createCharacter(
  charObj: Pick<Char, 'nickname' | 'prof' | 'sex' | 'owner' | 'harks' | 'magics'>,
) {
  if (await CharModel.exists({ owner: charObj.owner, deleted: false })) {
    throw new ValidationError('Для этого пользователя уже существует персонаж');
  }
  const character = await CharModel.create(charObj);
  const item = await ItemModel.firstCreate(character);
  await updateCharacter(character.id, { items: [item], equipment: { [ItemWear.MainHand]: item } });

  return findCharacter({ _id: character.id });
}

export async function updateCharacter(id: string, query: UpdateQuery<Char>) {
  return CharModel.findByIdAndUpdate(id, query, { new: true }).orFail(
    new Error('Персонаж не найден'),
  );
}
