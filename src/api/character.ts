import type { FilterQuery, UpdateQuery } from 'mongoose';
import { Char, CharDocument, CharModel } from '@/models/character';
import type { Clan } from '@/models/clan';
import { Inventory, InventoryModel } from '@/models/inventory';

export async function findCharacter(query: FilterQuery<CharDocument>) {
  const character = await CharModel
    .findOne({ ...query, deleted: false })
    .orFail(new Error('Персонаж не найден'))
    .populate<{inventory: Inventory}>('inventory')
    .populate<{clan: Clan}>('clan');

  return character.toObject();
}

export async function removeCharacter(id: string) {
  const character = await CharModel
    .findOneAndUpdate(
      { id, deleted: false },
      { deleted: true },
    )
    .orFail(new Error('Персонаж не найден'));

  return character.deleted;
}

export async function createCharacter(charObj: Pick<Char, 'nickname' | 'prof' | 'sex' | 'tgId' | 'harks' | 'magics'>) {
  const character = await CharModel.create(charObj);
  const item = await InventoryModel.firstCreate(character);
  await this.update(character.id, { inventory: [item] })
    .orFail(new Error('Персонаж не найден'));

  return findCharacter({ id: character.id });
}

export async function updateCharacter(id: string, query: UpdateQuery<CharDocument>) {
  return CharModel
    .findOneAndUpdate({ id, deleted: false }, query)
    .orFail(new Error('Персонаж не найден'));
}
