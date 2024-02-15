import casual from 'casual';
import type { AnyKeys } from 'mongoose';
import CharacterService from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import type { HistoryItem } from '@/arena/HistoryService';
import { profsList, profsData, type Prof } from '@/data/profs';
import { type Char, CharModel } from '@/models/character';
import { type Clan, ClanModel } from '@/models/clan';
import { InventoryModel } from '@/models/inventory';
import { type Item, ItemModel } from '@/models/item';
import { formatMessage } from '@/arena/LogService/utils';
import arena from '@/arena';

const functions = casual.functions();

export default class TestUtils {
  static async createCharacter(params?: Partial<Char>, {
    withWeapon = false,
  } = {}) {
    const prof: Prof = params?.prof ?? casual.random_element([...profsList]);
    const char = await CharModel.create({
      tgId: casual.integer(1_000_000, 9_999_999),
      nickname: functions.word(),
      sex: casual.random_element(['m', 'f']),
      prof,
      harks: profsData[prof].hark,
      magics: profsData[prof].mag,
      ...params,
    });

    if (withWeapon) {
      const weapon = await this.getWeapon();

      char.inventory = await InventoryModel.create([{
        wear: weapon.wear,
        code: weapon.code,
        owner: char.id,
        putOn: true,
      }]);

      await char.save();
    }

    await CharacterService.getCharacter(char.tgId);
    return char;
  }

  static getCharacter(id: string) {
    return CharModel.findById(id);
  }

  static resetCharacterCache() {
    arena.characters = {};
  }

  static async createClan(charId: string, params?: AnyKeys<Clan>) {
    const players = params?.players?.concat([charId]) ?? [charId];
    const created = await ClanModel.create({
      owner: charId,
      name: functions.word(),
      ...params,
      players,
    });
    const clan = await created.save();
    await CharModel.updateMany({ _id: { $in: players } }, { clan: clan.id });
    return ClanService.getClanById(clan.id);
  }

  static getClan(id: string) {
    return ClanModel.findById(id).populate('owner').populate('players').populate('requests');
  }

  static getClans() {
    return ClanModel.find();
  }

  static async getWeapon(): Promise<Item> {
    await ItemModel.load();
    return ItemModel.findOne({ code: 'a100' }).orFail();
  }

  static normalizeRoundHistory(history: HistoryItem[]) {
    return history.map((item) => {
      return formatMessage(item);
    }).join('\n');
  }
}
