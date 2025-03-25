import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { Char } from '@/models/character';
import { CharModel } from '@/models/character';
import type { Clan } from '@/models/clan';
import { ItemModel, type Item } from '@/models/item';
import { ItemWear } from '@fwo/shared';

export async function findCharacter(query: FilterQuery<Char>) {
  const character = await CharModel.findOne({ ...query, deleted: false })
    .orFail(new Error('Персонаж не найден'))
    .populate<{ items: Item[] }>('items')
    .populate<{ equipment: Map<ItemWear, Item> }>('equipment')
    .populate<{ clan: Clan }>('clan');

  return character.toObject({ minimize: false });
}

export async function removeCharacter(owner?: string | number) {
  const character = await CharModel.findOneAndUpdate(
    { owner, deleted: false },
    { deleted: true },
  ).orFail(new Error('Персонаж не найден'));

  return character.deleted;
}

export async function createCharacter(
  charObj: Pick<Char, 'nickname' | 'prof' | 'sex' | 'owner' | 'harks' | 'magics'>,
) {
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
