import type { QueryFilter, UpdateQuery } from 'mongoose';
import { Types } from 'mongoose';
import type { Char } from '@/models/character';
import { CharModel } from '@/models/character';
import type { Clan } from '@/models/clan';
import { ItemModel, type Item } from '@/models/item';
import { ItemWear } from '@fwo/shared';

export async function findCharacter(query: QueryFilter<Char>) {
  const character = await CharModel.findOne({ ...query, deleted: false })
    .orFail(new Error('Персонаж не найден'))
    .populate<{ items: Item[] }>('items')
    .populate<{ equipment: Map<ItemWear, Item> }>('equipment')
    .populate<{ clan: Clan }>('clan');

  const char = character.toObject({ minimize: false });

  return char;
}

export async function findCharacters(query: QueryFilter<Char>) {
  const characters = await CharModel.find({ ...query, deleted: false })
    .populate<{ items: Item[] }>('items')
    .populate<{ equipment: Map<ItemWear, Item> }>('equipment')
    .populate<{ clan: Clan }>('clan');

  return characters.map((c) => c.toObject({ minimize: false }));
}

export async function hasCharacter(query: QueryFilter<Char>) {
  const character = await CharModel.exists({ ...query, deleted: false, active: true });

  return !!character;
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
  await CharModel.updateMany(
    { owner: charObj.owner, deleted: false, active: true },
    { active: false },
  );
  const character = await CharModel.create(charObj);
  const item = await ItemModel.firstCreate(character);
  await updateCharacter(character.id, { items: [item], equipment: { [ItemWear.MainHand]: item } });

  return findCharacter({ _id: character.id });
}

export async function updateCharacter(id: string, query: UpdateQuery<Char>) {
  return CharModel.findByIdAndUpdate(id, query, { returnDocument: 'after' }).orFail(
    new Error('Персонаж не найден'),
  );
}

export async function deactivateOtherCharacters(owner: string, excludeId: string) {
  return CharModel.updateMany(
    { owner, _id: { $ne: new Types.ObjectId(excludeId) }, deleted: false },
    { active: false },
  );
}

export async function activateCharacter(id: string) {
  return CharModel.findByIdAndUpdate(id, { active: true }).orFail(
    new Error('Персонаж не найден'),
  );
}

export async function activateAnyCharacter(owner: string) {
  const character = await CharModel.findOne({ owner, deleted: false });
  if (character) {
    await CharModel.updateOne({ _id: character._id }, { active: true });
  }
}

export async function getCharactersByPSR({ limit = 25, games = 25 } = {}) {
  return CharModel.find({
    deleted: false,
    'statistics.games': { $gte: games },
    psr: { $gte: 50 },
  })
    .populate<{ clan: Clan }>('clan')
    .sort({ psr: -1 })
    .limit(limit)
    .exec();
}
