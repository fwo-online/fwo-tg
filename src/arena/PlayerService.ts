import Char from './CharacterService';
import { Clan } from '../models/clan';
import StatsService from './StatsService';
import FlagsConstructors from './Constuructors/FlagsConstructor';
import arena from './index';
import { MinMax } from '../models/item';

export interface Resists {
  fire: number;
  frost: number;
  acid: number;
  lighting: number;
  physical: number;
}

export interface Chance {
  fail?: Partial<Record<keyof typeof arena['magics'], number>>
  cast?: Partial<Record<keyof typeof arena['magics'], number>>
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
  manaReg: number;
  enReg: number;
  hit: MinMax;
  maxTarget: number;
  lspell: number;
  weight: number;
}
/**
 * PlayerService
 * @description Обьект игрока внутри боя ! Это не Character!
 * @module Service/Player
 */

// @todo нужно создать отдельный метод, для автоматического сложения всех харок
// аналогично парсеру.

/**
 * Обьект игрока со всеми плюшками
 */
export default class Player {
  nick: string;
  id: string;
  tgId: number;
  prof: string;
  lvl: number;
  clan: Clan;
  stats: StatsService;
  flags: FlagsConstructors;
  modifiers: {
    magics: {
      chance: Chance;
    }
    castChance: number;
  };
  resists: Partial<Resists>;
  skills: { [x: string]: number; };
  magics: { [x: string]: number; };
  statical: any;
  alive: boolean;
  proc: number;
  weapon: any;

  constructor(params: Char) {
    this.nick = params.nickname;
    this.id = params.id;
    this.tgId = params.tgId;
    this.prof = params.prof;
    this.lvl = params.lvl;
    this.clan = params.clan;
    this.stats = new StatsService({ ...params.def, ...params.harks });
    this.flags = new FlagsConstructors();
    // @todo закладка для вычисляемых статов
    this.modifiers = {
      magics: {
        chance: {
          ...params.chance,
        },
      },
      castChance: 0,
      ...params.modifiers,
    }; // Обьект
    // модификаторов
    this.resists = params.resists || {}; // Обьект резистов
    this.skills = params.skills || {}; // Обькт доступных скилов
    this.magics = params.magics || {}; // обьект изученых магий
    this.statical = params.statical || {}; // статически реген
    this.alive = true;
    this.proc = 100;
    this.weapon = params.getPutonedWeapon();
    return this;
  }

  /**
   * Загрузка чара в память
   * @param charId идентификатор чара
   */
  static loading(charId: string): Player {
    // @todo fast hack
    return new Player(arena.characters[charId]);
  }

  get failChance(): Chance['fail'] {
    return this.modifiers.magics.chance.fail ?? {};
  }

  get castChance(): Chance['cast'] {
    return this.modifiers.magics.chance.cast ?? {};
  }

  /**
   * Функция вернет обьект состояния Player
   */
  getStatus() {
    return {
      hp: this.stats.val('hp'),
    };
  }

  /**
   * Функция вернет обьект состояния Player для отображения команде
   */
  getFullStatus() {
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
}
