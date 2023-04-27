import type { UpdateQuery } from 'mongoose';
import type { Char } from '@/models/character';
import { Clan, ClanModel } from '@/models/clan';

export async function getClans(): Promise<Clan[]> {
  const clans = await ClanModel
    .find()
    .populate<{players: Char[]}>('players')
    .populate<{requests: Char[]}>('requests')
    .populate<{owner: Char}>('owner');

  return clans.map((clan) => clan.toObject());
}

export async function updateClan(id: string, query: UpdateQuery<Clan>): Promise<Clan> {
  const clan = await ClanModel
    .findByIdAndUpdate(id, query, { new: true })
    .orFail(new Error('Клан не найден'))
    .populate<{players: Char[]}>('players')
    .populate<{requests: Char[]}>('requests')
    .populate<{owner: Char}>('owner');

  return clan.toObject();
}

export async function getClanByPlayerRequest(id: string): Promise<Clan | undefined> {
  const clan = await ClanModel.findOne({ requests: id });
  return clan?.toObject();
}

export async function getClanById(id: string): Promise<Clan> {
  const clan = await ClanModel
    .findById(id)
    .orFail(new Error('Клан не найден'))
    .populate<{players: Char[]}>('players')
    .populate<{requests: Char[]}>('requests')
    .populate<{owner: Char}>('owner');

  return clan.toObject();
}

export async function deleteClan(_id: string, owner: string): Promise<void> {
  await ClanModel.deleteOne({ _id, owner }).orFail(new Error('Клан не найден'));
}

export async function createClan(owner: string, name: string): Promise<Clan> {
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

  return getClanById(createdClan.id);
}
