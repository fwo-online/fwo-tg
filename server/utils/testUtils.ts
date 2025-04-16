import casual from 'casual';
import type { AnyKeys } from 'mongoose';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import type { HistoryItem } from '@/arena/HistoryService';
import { formatMessage } from '@/arena/LogService/utils';
import { profsList, profsData, type Prof } from '@/data/profs';
import { type Char, CharModel } from '@/models/character';
import { type Clan, ClanModel } from '@/models/clan';
import { CharacterClass, itemSchema, ItemWear, type Item } from '@fwo/shared';
import { parse } from 'valibot';
import { ItemModel } from '@/models/item';

const functions = casual.functions();

export default class TestUtils {
  static async createCharacter(
    params?: Partial<Char>,
    { weapon }: { weapon?: { type?: string } } = {},
  ) {
    const prof: Prof = params?.prof ?? casual.random_element([...profsList]);
    const char = await CharModel.create({
      owner: casual.integer(1_000_000, 9_999_999).toString(),
      nickname: functions.word(),
      sex: casual.random_element(['m', 'f']),
      prof,
      harks: profsData[prof].hark,
      magics: profsData[prof].mag,
      ...params,
    });

    if (weapon) {
      const item = await this.getWeapon(weapon);

      char.items.push(item);
      char.equipment.set(ItemWear.MainHand, item);

      await char.save();
    }

    await CharacterService.getCharacter(char.owner);
    return char;
  }

  static async getCharacter(id: string) {
    const charatcter = await CharModel.findById(id);
    return charatcter?.toObject();
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

  static async getClan(id: string) {
    const clan = await ClanModel.findById(id)
      .populate('owner')
      .populate('players')
      .populate('requests');
    return clan?.toObject();
  }

  static async getClans() {
    const clans = await ClanModel.find();
    return clans.map((clan) => clan.toObject());
  }

  static async generateItems() {
    arena;
  }

  static async createItem(item: DeepPartial<Item>) {
    const createdItem = await ItemModel.create(
      parse(itemSchema, {
        code: functions.word(),
        info: { name: functions.word(), case: functions.word() },
        class: [
          CharacterClass.Archer,
          CharacterClass.Mage,
          CharacterClass.Priest,
          CharacterClass.Warrior,
        ],
        price: 1000,
        wear: 'body',
        tier: 0,
        ...item,
      }),
    );

    arena.items[createdItem.code] = createdItem;
    return createdItem;
  }

  static async getWeapon({ type }: { type?: string }) {
    return this.createItem({
      info: { name: 'Оружие', case: 'Оружием' },
      type: type || 'chop',
      wear: ItemWear.MainHand,
      hit: { min: 1, max: 12 },
    });
  }

  static normalizeRoundHistory(history: HistoryItem[]) {
    return history
      .map((item) => {
        return formatMessage(item);
      })
      .join('\n');
  }
}
