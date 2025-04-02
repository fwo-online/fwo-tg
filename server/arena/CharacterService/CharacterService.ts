import _ from 'lodash';
import type { UpdateQuery } from 'mongoose';
import { findCharacter, removeCharacter, updateCharacter } from '@/api/character';
import arena from '@/arena';
import config from '@/arena/config';
import { CharacterInventory } from './CharacterInventory';
import type { Char } from '@/models/character';
import type { Character, CharacterClass, CharacterPublic, ItemComponent } from '@fwo/shared';
import type { Item } from '@/models/item';
import { CharacterResources } from './CharacterResources';
import { ClanService } from '@/arena/ClanService';
import { CharacterAttributes } from '@/arena/CharacterService/CharacterAttributes';

/**
 * Конструктор персонажа
 * @todo сюда нужны будет get/set функции для intreface части
 * @todo Сейчас массив arena.player не является массивом объектов Character,
 * нужно переработать
 */

/**
 * Класс описывающий персонажа внутри игры
 */
export class CharacterService {
  mm: { status?: string; time?: number };
  inventory: CharacterInventory;
  resources: CharacterResources;
  attributes: CharacterAttributes;

  /**
   * Конструктор игрока
   */
  constructor(public charObj: Char) {
    this.inventory = new CharacterInventory(this);
    this.resources = new CharacterResources(this);
    this.attributes = new CharacterAttributes(this);
    this.charObj = charObj;
    this.mm = {};
    this.resetExpLimit();
  }

  wasLvlUp = false;
  autoreg = false;

  get id() {
    return this.charObj.id.toString();
  }

  get prof() {
    return this.charObj.prof;
  }

  get class() {
    return this.charObj.prof as CharacterClass;
  }

  get lvl(): number {
    const k = 1000 * config.lvlRatio;
    return Math.max(1, Math.floor(Math.log2(this.charObj.exp / k) + 2));
  }
  get owner() {
    return this.charObj.owner;
  }

  get nickname() {
    return this.charObj.nickname;
  }

  set expEarnedToday(value) {
    this.charObj.expLimit.earn = value;
  }

  get expEarnedToday() {
    return this.charObj.expLimit.earn;
  }

  get expLimitToday() {
    return this.lvl * config.lvlRatio * 2000;
  }

  get statistics() {
    return this.charObj.statistics;
  }

  get magics() {
    return this.charObj.magics || {};
  }

  get skills() {
    return this.charObj.skills || {};
  }

  get passiveSkills() {
    return this.charObj.passiveSkills || {};
  }

  get clan() {
    return this.charObj.clan;
  }

  get items(): Item[] {
    return this.inventory.items;
  }

  /** Суммарное количество опыта, требуемое для следующего уровня */
  get nextLvlExp() {
    return 2 ** (this.lvl - 1) * 1000 * config.lvlRatio;
  }

  get favoriteMagicList() {
    return this.charObj.favoriteMagicList;
  }

  /** @type {string[]} */
  set favoriteMagicList(value) {
    this.charObj.favoriteMagicList = value;
  }

  async changeNickname(newNickname: string) {
    this.charObj.nickname = newNickname;
    await this.saveToDb();
  }

  resetExpLimit() {
    const date = new Date();
    if (date > this.charObj.expLimit.expiresAt) {
      date.setUTCHours(24, 0, 0, 0);
      this.charObj.expLimit.expiresAt = date;
      this.charObj.expLimit.earn = 0;
    }
  }

  /**
   * @param {Partial<Statistics>} stat
   */
  addGameStat(stat: Record<string, number>) {
    _.forEach(stat, (val, key) => {
      this.charObj.statistics[key] += val;
    });

    this.saveToDb();
  }

  /**
   * @param {string} reason
   */
  getPenaltyDate(reason: string) {
    const penalty = this.charObj.penalty.find((p) => p.reason === reason);
    if (penalty && penalty.date.valueOf() > Date.now()) {
      return penalty.date;
    }
    return false;
  }

  /**
   * @param {string} reason
   * @param {number} minutes
   */
  async updatePenalty(reason: string, minutes: number) {
    const date = new Date();
    date.setHours(date.getHours(), date.getMinutes() + minutes);

    const penalty = { reason, date };
    const index = this.charObj.penalty.findIndex((p) => p.reason === reason);

    if (index === -1) {
      this.charObj.penalty.push(penalty);
    } else {
      this.charObj.penalty[index] = penalty;
    }
    await this.saveToDb();
  }

  /**
   * @param {Clan} clan
   */
  async joinClan(clan) {
    this.charObj.clan = clan;
    await this.saveToDb();
    const char = await CharacterService.getCharacter(this.owner);
    return char;
  }

  async leaveClan() {
    this.charObj.clan = undefined;
    await this.updatePenalty('clan_leave', 5 * 24 * 60);
  }

  /**
   * @desc Получает идентификатор игры из charId участника
   * @return gameId идентификатор игры
   */
  get gameId() {
    return this.mm.status || '';
  }

  /**
   * Setter gameId
   * @param newStatus новый статус mm персонажа
   */
  set gameId(newStatus) {
    this.mm.status = newStatus;
  }

  get currentGame() {
    return arena.games[this.gameId];
  }

  /**
   * Загрузка чара в память
   * @param {string} owner идентификатор пользователя в TG (tgId)
   */
  static async getCharacter(owner: string) {
    const charFromDb = await findCharacter({ owner });

    const cachedChar = arena.characters[charFromDb.id];
    if (cachedChar) {
      return cachedChar;
    }

    const char = new CharacterService(charFromDb);
    arena.characters[char.id] = char;
    return char;
  }

  /**
   * Загрузка чара в память
   * @param {string} id идентификатор пользователя
   */
  static async getCharacterById(id: string) {
    const cachedChar = arena.characters[id];
    if (cachedChar) {
      return cachedChar;
    }

    const charFromDb = await findCharacter({ _id: id });

    const char = new CharacterService(charFromDb);
    arena.characters[id] = char;
    return char;
  }

  /**
   * Возвращает объект игры по Id чара
   * @param {String} charId идентификатор чара;
   * @return {this} Объект игры
   * @todo нужно перенести это не в static а во внутрь экземпляра класса
   */
  static getGameFromCharId(charId: string) {
    const { gameId } = arena.characters[charId];
    if (arena.games[gameId]) {
      return arena.games[gameId];
    }
    throw Error('gameId_error');
  }

  /**
   * Функция получения новой магии
   * @param magicId идентификатор магии
   * @param lvl уровень проученной магии
   */
  async learnMagic(magicId: string, lvl: number) {
    this.magics[magicId] = lvl;
    // опасный тест
    await this.saveToDb();
  }

  /**
   * Получение нового умения
   * @param {string} skillId идентификатор умения
   * @param {number} lvl уровень проученного умения
   */
  async learnSkill(skillId: string, lvl: number) {
    this.skills[skillId] = lvl;
    await this.saveToDb();
  }

  async learnPassiveSkill(skillId: string, lvl: number) {
    this.passiveSkills[skillId] = lvl;
    await this.saveToDb();
  }

  /**
   * Сохраняет состояние чара в базу
   * @param {import('mongoose').UpdateQuery<import ('@/models/character').Char>} [query]
   */
  async save(query: UpdateQuery<Char>) {
    console.log('Saving char :: id', this.id);
    try {
      return await updateCharacter(this.id, query);
    } catch (e) {
      console.error('Fail on CharSave:', e);
    }
  }

  /**
   * Сохраняет состояние чара в базу
   * @todo важная функция которая сохраняет параметры чара в базу
   * @deprecated
   */
  async saveToDb() {
    try {
      console.log('Saving char :: id', this.id);
      const { magics, skills, passiveSkills, clan } = this;
      const { gold, components, exp, free, bonus } = this.resources;
      const { items, equipment } = this.inventory;

      return await updateCharacter(this.id, {
        nickname: this.charObj.nickname,
        gold,
        exp,
        magics,
        bonus,
        skills,
        clan,
        passiveSkills,
        components,
        penalty: this.charObj.penalty,
        free,
        expLimit: this.charObj.expLimit,
        statistics: this.charObj.statistics,
        harks: this.charObj.harks,
        items,
        equipment,
      });
    } catch (e) {
      console.error('Fail on CharSave:', e);
    }
  }

  async remove() {
    if (this.clan?.owner._id.equals(this.id)) {
      await ClanService.removeClan(this.clan.id, this.id);
    } else if (this.clan) {
      await ClanService.leaveClan(this.clan.id, this.id);
    }

    await removeCharacter(this.id);
    delete arena.characters[this.id];
  }

  toObject(): Character {
    return {
      id: this.id,
      owner: this.owner,
      name: this.nickname,
      class: this.prof as CharacterClass,
      attributes: this.attributes.attributes,
      magics: this.magics,
      skills: this.skills,
      passiveSkills: this.passiveSkills,
      clan: this.clan ? ClanService.toPublicObject(this.clan) : undefined,
      free: this.charObj.free,
      bonus: this.resources.bonus,
      gold: this.resources.gold,
      lvl: this.lvl,
      exp: this.resources.exp,
      dynamicAttributes: this.attributes.getDynamicAttributes(),
      game: this.currentGame?.info.id,
      components: Object.fromEntries(this.resources.components.entries()) as Record<
        ItemComponent,
        number
      >,
      ...this.inventory.toObject(),
    };
  }

  toPublicObject(): CharacterPublic {
    return {
      id: this.id,
      name: this.nickname,
      class: this.prof as CharacterClass,
      lvl: this.lvl,
      clan: this.clan ? ClanService.toPublicObject(this.clan) : undefined,
    };
  }
}
