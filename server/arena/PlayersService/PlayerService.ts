import type { CharacterClass, GameStatus, Player } from '@fwo/shared';
import arena from '@/arena';
import type { ActionKey } from '@/arena/ActionService';
import type { CharacterService } from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import FlagsConstructor from '@/arena/Constuructors/FlagsConstructor';
import type { DamageType } from '@/arena/Constuructors/types';
import ValidationError from '@/arena/errors/ValidationError';
import { PlayerOffHand } from '@/arena/PlayersService/PlayerOffHand';
import StatsService from '@/arena/StatsService';
import { StreakHelper } from '@/helpers/streakHelper';
import type { Clan } from '@/models/clan';
import { PlayerWeapon } from './PlayerWeapon';
import { convertItemModifiers } from './utils';

export type Resists = Record<DamageType, number>;

export interface Chance {
  fail: Partial<Record<ActionKey, number>>;
  cast: Partial<Record<ActionKey, number>>;
}

/**
 * PlayerService
 * @description Объект игрока внутри боя ! Это не Character!
 * @module Service/Player
 */
export default class PlayerService {
  nick: string;
  id: string;
  owner: string;
  prof: CharacterClass;
  lvl: number;
  clan?: Clan;
  stats: StatsService;
  flags: FlagsConstructor;
  psr: number;
  modifiers: {
    chance: Chance;
    castChance: number;
  };

  resists: Partial<Resists>;
  skills: Record<string, number>;
  magics: Record<string, number>;
  passiveSkills: Record<string, number>;
  favoriteMagics: string[];
  alive: boolean;
  proc: number;
  weapon: PlayerWeapon;
  offHand: PlayerOffHand;
  isBot: boolean;
  failStreak = new StreakHelper<ActionKey>();

  constructor(params: CharacterService, isBot = false) {
    this.nick = params.nickname;
    this.id = params.id;
    this.owner = params.owner;
    this.prof = params.prof as CharacterClass;
    this.lvl = params.lvl;
    this.clan = params.clan;
    this.favoriteMagics = params.favoriteMagicList;
    this.psr = params.performance.psr;
    this.stats = new StatsService(params.attributes.getDynamicAttributes());
    this.flags = new FlagsConstructor();
    this.modifiers = {
      chance: convertItemModifiers(params.inventory.modifiers),
      castChance: 0,
    }; // Объект модификаторов
    this.resists = {}; // Объект резистов
    this.skills = params.skills || {}; // Обькт доступных скилов
    this.magics = params.magics || {}; // объект изученых магий
    this.passiveSkills = params.passiveSkills || {};
    this.alive = true;
    this.proc = 100;
    this.weapon = new PlayerWeapon(params.inventory.getEquippedWeapon());
    this.offHand = new PlayerOffHand(params.inventory.getEquippedOffHand());
    this.isBot = isBot;
  }

  /**
   * Загрузка чара в память
   * @param charId идентификатор чара
   */
  static load(charId: string) {
    return new PlayerService(arena.characters[charId]);
  }

  get performance() {
    return this.stats.collect.performance;
  }

  getFailChance(action: ActionKey) {
    return this.modifiers.chance.fail[action] ?? 0;
  }

  getCastChance(action: ActionKey) {
    return this.modifiers.chance.cast[action] ?? 0;
  }

  /**
   * Функция вернет объект состояния Player для отображения команде
   */
  getStatus(): GameStatus {
    return {
      id: this.id,
      name: this.nick,
      hp: this.stats.val('hp'),
      mp: this.stats.val('mp'),
      en: this.stats.val('en'),
      maxHP: this.stats.val('base.hp'),
      maxMP: this.stats.val('base.mp'),
      maxEN: this.stats.val('base.en'),
    };
  }

  /**
   * Возвращает убийцу игрока если он записан
   */
  getKiller(): string {
    return this.flags.isDead;
  }

  kill(killer: PlayerService, action: string) {
    this.flags.isDead = killer.id;
    this.flags.isKilledBy = action;
  }

  /**
   * Устанавливает убийцу игрока
   * @param player записывает id убийцы
   */
  setKiller(player: PlayerService): void {
    this.flags.isDead = player.id;
  }

  resetKiller(): void {
    this.flags.isDead = '';
    this.flags.isKilledBy = '';
  }

  setProc(proc: number) {
    this.proc = proc;
  }

  /** @throws {ValidationError} */
  takeProc(proc: number) {
    if (proc > this.proc) {
      throw new ValidationError('Недостаточно процентов');
    }

    this.proc -= proc;
  }

  reset() {
    this.proc = 100;
    this.stats.refresh();
    this.flags.refresh();
  }

  setDead() {
    this.alive = false;
  }

  preKick(reason?: 'run' | 'afk') {
    this.flags.isKicked = reason;
  }

  getMagicLevel(magic: string) {
    return this.magics[magic] ?? 0;
  }

  getSkillLevel(skill: string) {
    return this.skills[skill] ?? 0;
  }

  getPassiveSkillLevel(passiveSkill: string) {
    return this.passiveSkills[passiveSkill] ?? 0;
  }

  isAlly(player: PlayerService, includeSelf = true) {
    if (player.id === this.id) {
      return includeSelf;
    }

    if (!this.clan || !player.clan) {
      return false;
    }

    return this.clan.id === player.clan.id;
  }

  toObject(): Player {
    return {
      id: this.id,
      name: this.nick,
      class: this.prof,
      lvl: this.lvl,
      clan: this.clan ? ClanService.toPublicObject(this.clan) : undefined,
      alive: this.alive,
      weapon: this.weapon.item?.info,
      isBot: this.isBot,
    };
  }
}
