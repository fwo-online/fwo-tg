import type { UpdateQuery } from 'mongoose';
import type { Char, CharDocument } from '@/models/character';
import { ClanDocument, ClanModel } from '@/models/clan';

export async function getClans() {
  const clans = await ClanModel
    .find()
    .populate<{players: Char[]}>('players')
    .populate<{requests: Char[]}>('requests')
    .populate<{owner: Char}>('owner');

  return clans.map((clan) => clan.toObject());
}

export async function updateClan(id: string, query: UpdateQuery<ClanDocument>) {
  const clan = await ClanModel
    .findByIdAndUpdate(id, query)
    .orFail(new Error('Клан не найден'))
    .populate<{players: Char[]}>('players')
    .populate<{requests: Char[]}>('requests')
    .populate<{owner: Char}>('owner');

  return clan.toObject();
}

export async function getClanByPlayerRequest(id: string) {
  const clan = await ClanModel.findOne({ requests: id });
  return clan?.toObject();
}

export async function getClanById(id: string) {
  const clan = await ClanModel
    .findById(id)
    .orFail(new Error('Клан не найден'))
    .populate<{players: Char[]}>('players')
    .populate<{requests: Char[]}>('requests')
    .populate<{owner: Char}>('owner');

  return clan.toObject();
}

export async function deleteClan(id: string, owner: string) {
  await ClanModel.deleteOne({ id, owner }).orFail(new Error('Клан не найден'));
}

export async function createClan(owner: string, name: string) {
  const exists = await ClanModel.exists({ name: { $regex: name, $options: 'i' } });
  if (exists) {
    throw new Error('Кто-то придумал это до тебя!');
  }

  const createdClan = await ClanModel.create({
    owner,
    name,
    players: [owner],
  });
  await createdClan.save();

  const clan = await ClanModel
    .findById(createdClan.id)
    .orFail(new Error('Клан не найден'))
    .populate<{players: CharDocument[]}>('players')
    .populate<{requests: Char[]}>('requests')
    .populate<{owner: Char}>('owner');

  return clan.toObject();
}
