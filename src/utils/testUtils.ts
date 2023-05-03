import casual from 'casual';
import type { AnyKeys } from 'mongoose';
import CharacterService from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import { profsList, profsData, Prof } from '@/data/profs';
import { Char, CharModel } from '@/models/character';
import { Clan, ClanModel } from '@/models/clan';
import { Item, ItemModel } from '@/models/item';

const functions = casual.functions();

export default class TestUtils {
  static async createCharacter(params?: Partial<Char>) {
    const prof: Prof = casual.random_element([...profsList]);
    const [char] = await CharModel.create([{
      tgId: casual.integer(1_000_000, 9_999_999),
      nickname: functions.word(),
      sex: casual.random_element(['m', 'f']),
      prof,
      harks: profsData[prof].hark,
      magics: profsData[prof].mag,
      ...params,
    }], { session: global.session });
    await CharacterService.getCharacter(char.tgId);
    return char;
  }

  static getCharacter(id: string) {
    return CharModel.findById(id, null, { session: global.session });
  }

  static async createClan(charId: string, params?: AnyKeys<Clan>) {
    const players = params?.players?.concat([charId]) ?? [charId];
    const [created] = await ClanModel.create([{
      owner: charId,
      name: functions.word(),
      ...params,
      players,
    }], { session: global.session });
    const clan = await created.save({ session: global.session });
    await CharModel.updateMany({ _id: { $in: players } }, { clan: clan.id }, { session: global.session });
    return ClanService.getClanById(clan.id);
  }

  static getClan(id: string) {
    return ClanModel.findById(id, null, { session: global.session }).populate('owner').populate('players').populate('requests');
  }

  static getClans() {
    return ClanModel.find({}, null, { session: global.session });
  }

  static async getWeapon(): Promise<Item> {
    await ItemModel.load();
    return ItemModel.findOne({ code: 'a100' }, null, { session: global.session }).orFail();
  }
}
