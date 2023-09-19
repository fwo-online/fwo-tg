import arena from '@/arena';
import type Char from '@/arena/CharacterService';
import FlagsConstructor from '@/arena/Constuructors/FlagsConstructor';
import type { DamageType } from '@/arena/Constuructors/types';
import type * as magics from '@/arena/magics';
import StatsService, { Stats } from '@/arena/StatsService';
import type { Prof } from '@/data/profs';
import type { Clan } from '@/models/clan';
import type { Inventory } from '@/models/inventory';
import type { MinMax } from '@/models/item';

export type Resists = Record<DamageType, number>;

export interface Chance {
  fail?: Partial<Record<keyof typeof magics, number>>
  cast?: Partial<Record<keyof typeof magics, number>>
}

export interface Statical {
  atc: number;
  prt: number;
  add_hp: number;
  add_mp: number;
  add_en: number;
  mga: number;
  mgp: number;
  hl: MinMax;
  reg_mp: number;
  reg_en: number;
  hit: MinMax;
  maxTarget: number;
  lspell: number;
  weight: number;
}
/**
 * PlayerService
 * @description Объект игрока внутри боя ! Это не Character!
 * @module Service/Player
 */

// @todo нужно создать отдельный метод, для автоматического сложения всех харок
// аналогично парсеру.

/**
 * Объект игрока со всеми плюшками
 */
export default class Player {
  nick: string;
  id: string;
  tgId: number;
  prof: Prof;
  lvl: number;
  clan?: Clan;
  stats: StatsService;
  flags: FlagsConstructor;
  modifiers: {
    magics: {
      chance: Chance;
    }
    castChance: number;
  };

  resists: Partial<Omit<Resists, 'clear'>>;
  skills: Record<string, number>;
  magics: Record<string, number>;
  favoriteMagics: string[];
  statical: Partial<Statical>;
  alive: boolean;
  proc: number;
  weapon?: Inventory;

  constructor(params: Char) {
    this.nick = params.nickname;
    this.id = params.id;
    this.tgId = params.tgId;
    this.prof = params.prof;
    this.lvl = params.lvl;
    this.clan = params.clan;
    this.favoriteMagics = params.favoriteMagicList;
    this.stats = new StatsService({ ...params.def, ...params.harks });
    this.flags = new FlagsConstructor();
    // @todo закладка для вычисляемых статов
    this.modifiers = {
      magics: {
        chance: {
          ...params.chance,
        },
      },
      castChance: 0,
      ...params.modifiers,
    }; // Объект
    // модификаторов
    this.resists = params.resists || {}; // Объект резистов
    this.skills = params.skills || {}; // Обькт доступных скилов
    this.magics = params.magics || {}; // объект изученых магий
    this.statical = params.statical || {}; // статически реген
    this.alive = true;
    this.proc = 100;
    this.weapon = params.getPutonedWeapon();
  }

  /**
   * Загрузка чара в память
   * @param charId идентификатор чара
   */
  static load(charId: string) {
    return new Player(arena.characters[charId]);
  }

  get failChance(): Chance['fail'] {
    return this.modifiers.magics.chance.fail ?? {};
  }

  get castChance(): Chance['cast'] {
    return this.modifiers.magics.chance.cast ?? {};
  }

  /**
   * Функция вернет объект состояния Player
   */
  getStatus(): Pick<Stats, 'hp'> {
    return {
      hp: this.stats.val('hp'),
    };
  }

  /**
   * Функция вернет объект состояния Player для отображения команде
   */
  getFullStatus(): Pick<Stats, 'hp' | 'mp' | 'en'> {
    return {
      hp: this.stats.val('hp'),
      mp: this.stats.val('mp'),
      en: this.stats.val('en'),
    };
  }

  /**
  * Возвращает убийцу игрока если он записан
  */
  getKiller(): string {
    return this.flags.isDead;
  }

  /**
  * Устанавливает убийцу игрока
  * @param player записывает id убийцы
  */
  setKiller(player: Player): void {
    this.flags.isDead = player.id;
  }

  resetKiller(): void {
    this.flags.isDead = '';
  }

  setProc(proc: number) {
    this.proc = proc;
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
}
