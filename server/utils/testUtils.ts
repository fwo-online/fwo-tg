import { spyOn } from 'bun:test';
import { CharacterClass, type Item, ItemWear, itemSchema } from '@fwo/shared';
import type { AnyKeys } from 'mongoose';
import { parse } from 'valibot';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import GameService from '@/arena/GameService';
import type { HistoryItem } from '@/arena/HistoryService';
import { formatMessage } from '@/arena/LogService/utils';
import MiscService from '@/arena/MiscService';
import { type Prof, profsData } from '@/data/profs';
import { type Char, CharModel } from '@/models/character';
import { type Clan, ClanModel } from '@/models/clan';
import { ItemModel } from '@/models/item';

export default class TestUtils {
  static charCount = 0;
  static itemCount = 0;
  static clanCount = 0;

  static resetCount() {
    TestUtils.charCount = 0;
    TestUtils.itemCount = 0;
    TestUtils.clanCount = 0;
  }

  static async createCharacter(
    params?: Partial<Char & { weapon?: { type?: string } }>,
    { save = false } = {},
  ) {
    const prof: Prof = params?.prof ?? CharacterClass.Warrior;
    const char = new CharModel({
      owner: MiscService.randInt(1_000_000, 9_999_999).toString(),
      nickname: `Игрок ${++TestUtils.charCount}`,
      sex: 'm',
      prof,
      harks: profsData[prof].hark,
      magics: profsData[prof].mag,
      ...params,
    });

    /** @todo удалить полностью сохранение в db */
    if (save) {
      await char.save();
    }

    if (params?.weapon) {
      const item = await TestUtils.getWeapon(params?.weapon, { save });

      char.items.push(item);
      char.equipment.set(ItemWear.MainHand, item);

      if (save) {
        await char.save();
      }
    }

    if (save) {
      await CharacterService.getCharacterById(char.id);
    } else {
      arena.characters[char.id] = new CharacterService(char);
    }

    return char;
  }

  static async getCharacter(id: string) {
    const charatcter = await CharModel.findById(id);
    return charatcter?.toObject();
  }

  static resetCharacterCache() {
    arena.characters = {};
  }

  static async createClan(owner: Char, params?: AnyKeys<Clan>, { save = false } = {}) {
    const players = params?.players?.concat([owner]) ?? [owner];
    const clan = await new ClanModel({
      owner,
      name: `Клан ${++TestUtils.clanCount}`,
      ...params,
      players,
    });

    if (save) {
      await clan.save();
      await CharModel.updateMany({ _id: { $in: players } }, { clan: clan.id });
      return ClanService.getClanById(clan.id);
    } else {
      arena.clans.set(clan.id, clan);
      players.forEach((player: Char) => {
        player.clan = clan;
      });
    }

    return clan;
  }

  static async createGame(params: Partial<Char & { weapon?: { type?: string } }>[]) {
    const players = await Promise.all(params.map((params) => TestUtils.createCharacter(params)));

    return new GameService(players.map(({ id }) => id));
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

  static async createItem(item: DeepPartial<Item>, { save = false } = {}) {
    const createdItem = new ItemModel(
      parse(itemSchema, {
        code: `code_${++TestUtils.itemCount}`,
        info: { name: `Оружие`, case: `Оружием` },
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

    if (save) {
      await createdItem.save();
    }

    arena.items[createdItem.code] = createdItem;
    return createdItem;
  }

  static async getWeapon({ type }: { type?: string }, { save = false } = {}) {
    return this.createItem(
      {
        info: { name: 'Оружие', case: 'Оружием' },
        type: type || 'chop',
        wear: ItemWear.MainHand,
        hit: { min: 1, max: 12 },
      },
      { save },
    );
  }

  static normalizeRoundHistory(history: HistoryItem[]) {
    return history
      .map((item) => {
        return formatMessage(item);
      })
      .join('\n');
  }

  static mockRandom(value = 0.5) {
    spyOn(global.Math, 'random').mockReturnValue(value);
  }

  static restoreRandom() {
    spyOn(global.Math, 'random').mockRestore();
  }
}
