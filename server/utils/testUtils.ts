import { spyOn } from 'bun:test';
import { CharacterClass, type Item, ItemWear, itemSchema, ForestState } from '@fwo/shared';
import type { AnyKeys } from 'mongoose';
import { parse } from 'valibot';
import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import { ForestService } from '@/arena/ForestService/ForestService';
import GameService from '@/arena/GameService';
import type { HistoryItem } from '@/arena/HistoryService';
import { formatMessage } from '@/arena/LogService/utils';
import MiscService from '@/arena/MiscService';
import { Player } from '@/arena/PlayersService';
import { type Prof, profsData } from '@/data/profs';
import { type Char, CharModel } from '@/models/character';
import { type Clan, ClanModel } from '@/models/clan';
import { ForestModel } from '@/models/forest';
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

  static async createCharacter(params?: Partial<Char & { weapon?: { type?: string } }>) {
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

    if (params?.weapon) {
      const item = await TestUtils.getWeapon(params?.weapon);

      char.items.push(item);
      char.equipment.set(ItemWear.MainHand, item);
    }

    arena.characters[char.id] = new CharacterService(char);
    spyOn(arena.characters[char.id], 'saveToDb').mockImplementation(() => Promise.resolve());

    return char;
  }

  static async getCharacter(id: string) {
    const charatcter = await CharModel.findById(id);
    return charatcter?.toObject();
  }

  static resetCharacterCache() {
    arena.characters = {};
  }

  static async createClan(owner: Char, params?: AnyKeys<Clan>) {
    const players = params?.players?.concat([owner]) ?? [owner];
    const clan = await new ClanModel({
      owner,
      name: `Клан ${++TestUtils.clanCount}`,
      ...params,
      players,
    });

    arena.clans.set(clan.id, clan);
    players.forEach((player: Char) => {
      player.clan = clan;
    });

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

  static async createItem(item: DeepPartial<Item>) {
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

  static mockRandom(value = 0.5) {
    spyOn(global.Math, 'random').mockReturnValue(value);
  }

  static restoreRandom() {
    spyOn(global.Math, 'random').mockRestore();
  }

  static async createForest(charParams?: Partial<Char & { weapon?: { type?: string } }>) {
    const char = await TestUtils.createCharacter(charParams);
    const character = arena.characters[char.id];

    const forest = new ForestModel({
      player: char.id,
      state: ForestState.Waiting,
      startedAt: new Date(),
    });

    const forestService = new ForestService(char.id);
    // @ts-expect-error - setting private property for testing
    forestService.forest = forest;
    // @ts-expect-error - setting private property for testing
    forestService.character = character;
    forestService.player = new Player(character);

    // Mock save method to avoid database calls
    spyOn(forest, 'save').mockImplementation(() => Promise.resolve(forest));

    arena.forests[forest.id] = forestService;
    character.forestID = forest.id;

    return { char, character, forest, forestService };
  }

  static cleanupForests() {
    for (const id of Object.keys(arena.forests)) {
      delete arena.forests[id];
    }
  }
}
