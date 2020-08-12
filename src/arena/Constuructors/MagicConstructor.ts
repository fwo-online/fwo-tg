import Player from '../PlayerService';
import Game from '../GameService';
import MiscService from '../MiscService';
import floatNumber from '../floatNumber';
import arena from '../index';

export interface BaseMagic {
  name: keyof typeof arena['magics'];
  displayName: string;
  desc: string;
  cost: number;
  costType: 'mp' | 'en';
  lvl: string;
  orderType: 'all' | 'any' | 'enemy' | 'self';
  aoeType: 'target' | 'team';
  baseExp: number;
  effect: string[];
  magType: 'bad' | 'good';
  chance: number[] | string[];
  profList: string[];
}

/**
 * @typedef {import ('../PlayerService').default} player
 * @typedef {import ('../GameService')} game
 * @typedef {Object} baseMag
 * @property {string} name Имя магии
 * @property {string} displayName Отображаемое имя
 * @property {string} desc Короткое описание
 * @property {number} cost Стоимость за использование
 * @property {string} costType Тип единицы стоимости {en/mp}
 * @property {number} lvl Требуемый уровень круга магий для использования
 * @property {string} orderType Тип цели заклинания self/team/enemy/enemyTeam
 * @property {string} aoeType Тип нанесения урона по цели:
 * @property {number} baseExp Стартовый параметр exp за действие
 * @property {string[]} [effect] размер рандомного эффект от магии
 * @property {string} magType Тип магии good/bad/neutral
 * @property {number[] | string[]} chance
 * @property {string[]} profList
 */

/**
 * Конструктор магии
 */
export default abstract class Magic implements BaseMagic {
  name: keyof typeof arena['magics'];
  displayName: string;
  desc: string;
  cost: number;
  costType: 'mp' | 'en';
  lvl: string;
  orderType: 'all' | 'any' | 'enemy' | 'self';
  aoeType: 'target' | 'team';
  baseExp: number;
  effect: string[];
  magType: 'bad' | 'good';
  chance: string[] | number[];
  profList: string[];
  status: {
    exp: number;
  }
  params!: {
    initiator: Player;
    target: Player;
    game: Game;
  }
  /**
   * Создание магии
   * @param {baseMag} magObj Обьект создаваемой магии
   */
  constructor(magObj: Magic) {
    this.name = magObj.name;
    this.desc = magObj.desc;
    this.cost = magObj.cost;
    this.costType = magObj.costType;
    this.lvl = magObj.lvl;
    this.orderType = magObj.orderType;
    this.aoeType = magObj.aoeType;
    this.baseExp = magObj.baseExp;
    this.effect = magObj.effect;
    this.magType = magObj.magType;
    this.chance = magObj.chance;
    this.displayName = magObj.displayName;
    this.profList = magObj.profList;
    this.status = {
      exp: 0,
    };
  }

  /**
   * Длительная ли магия
   */
  get isLong(): boolean {
    return this.constructor.name === 'LongMagic' || this.constructor.name
        === 'LongDmgMagic';
  }

  // Дальше идут общие методы для всех магий
  /**
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param initiator Обьект кастера
   * @param target Обьект цели
   * @param game Обьект игры
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.params = {
      initiator, target, game,
    };
    try {
      this.getCost(initiator);
      this.checkPreAffects(initiator, target, game);
      this.isblurredMind(); // проверка не запудрило
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.getExp(initiator);
      this.checkTargetIsDead();
      this.next(initiator, target);
    } catch (failMsg) {
      const bl = this.params.game.battleLog;
      // @fixme прокидываем ошибку выше для длительных кастов
      if (this.isLong) throw (failMsg);
      bl.log(failMsg);
      this.params = null;
    }
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param initiator Обьект кастера
   */
  getCost(initiator: Player): void {
    const costValue = +initiator.stats.val(this.costType) - this.cost;
    console.log('MP:', costValue);
    if (costValue >= 0) {
      // eslint-disable-next-line no-param-reassign
      initiator.stats.mode('set', this.costType, costValue);
    } else {
      throw this.breaks('NO_MANA');
    }
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param initiator Обьект кастера
   */
  getExp(initiator: Player): void {
    this.status.exp = Math.round(this.baseExp * initiator.proc);
    initiator.stats.mode('up', 'exp', this.baseExp);
  }

  /**
   * Функция расчитывай размер эффекат от магии по стандартным дайсам
   * @return dice число эффекта
   */
  effectVal(): number {
    const { initiator } = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    const x = MiscService.dice(this.effect[initiatorMagicLvl - 1]) * initiator.proc;
    return floatNumber(x);
  }

  /**
   * Проверка прошла ли магия
   * @return
   */
  checkChance(): true | void {
    // Если шанс > random = true
    if (MiscService.rndm('1d100') <= this.getChance()) {
      // Магия прошла, проверяем что скажут боги
      if (this.godCheck()) {
        // Боги фейлят шанс
        throw this.breaks('GOD_FAIL');
      } else {
        // Магия прошла
        return true;
      }
    } else {
      // Магия провалилась, проверяем что скажут боги
      if (this.godCheck()) {
        // Боги помогают
        return true;
      }
      // Магия остается феловой
      throw this.breaks('CHANCE_FAIL');
    }
  }

  /**
   * Возвращает шанс прохождения магии
   * @return result шанс прохождения
   */
  getChance(): number {
    const { initiator, target } = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    const imc = initiator.modifiers.castChance; // мод шанс прохождения
    const castChance = initiator.castChance?.[this.name] ?? 0; // мод action'а
    const failChance = target.failChance?.[this.name] ?? 0;
    let chance = this.chance[initiatorMagicLvl - 1];
    if (typeof chance === 'string') {
      chance = MiscService.dice(chance);
    }
    let result = chance + imc;

    if (castChance) {
      // если модификатор шанса для этого скила есть,
      // то плюсуем его к шансу
      result += castChance;
    }

    if (failChance) {
      result -= failChance;
    }
    // тут нужно взять получившийся шанс и проверить ещё отношение mga цели
    // @todo magics cast chance
    if (this.magType === 'bad') {
      const x = (initiator.stats.val('mga') / target.stats.val('mgp')) * 3;
      result += x;
    }
    console.log('chance is :', result, 'total', result * initiator.proc);
    return result * initiator.proc;
  }

  /**
   * Функция воли богов
   * @return true/false решение богов
   */
  // eslint-disable-next-line class-methods-use-this
  godCheck(): boolean {
    return MiscService.rndm('1d100') <= 5;
  }

  /**
   * @param initiator обьект персонажа
   * @param target обьект персонажа
   * @param game Обьект игры для доступа ко всему
   */
  abstract run(initiator: Player, target: Player, game: Game): void

  /**
   * @param initiator обьект персонажа
   * @param target обьект персонажа
   * @param game Обьект игры для доступа ко всему
   */
  abstract longRun(initiator: Player, target: Player, game: Game): void

  /**
   * Проверка на запудревание мозгов
   * @todo нужно вынести этот метод в orders или к Players Obj
   */
  isblurredMind(): void {
    const { initiator, game } = this.params;
    if (initiator.flags.isGlitched) {
      this.params.target = game.playerArr.randomAlive;
    }
  }

  /**
   * Проверка на запудревание мозгов
   * @param initiator обьект персонажаы
   * @param _target обьект цели магии
   * @param _game Обьект игры для доступа ко всему
   * @todo нужно вынести этот метод в orders
   */
  // eslint-disable-next-line no-unused-vars
  checkPreAffects(initiator: Player, _target: Player, _game: Game): void {
    const { isSilenced } = initiator.flags;
    if (isSilenced && isSilenced.some((e) => e.initiator !== this.name)) {
      // если кастер находится под безмолвием/бунтом богов
      throw this.breaks('SILENCED');
    }
  }

  /**
   * Проверка убита ли цель
   * @todo после того как был нанесен урон любым dmg action, следует произовдить
   * общую проверку
   */
  checkTargetIsDead(): void {
    const { initiator, target } = this.params;
    const hpNow = target.stats.val('hp');
    if (hpNow <= 0 && !target.getKiller()) {
      target.setKiller(initiator);
    }
  }

  /**
   * @param msg строка остановки магии (причина)
   * @return обьект остановки магии
   */
  breaks(msg: string) {
    return {
      actionType: 'magic',
      message: msg,
      action: this.displayName,
      initiator: this.params.initiator.nick,
      target: this.params.target.nick,
    };
  }

  /**
   * Магия прошла удачно
   * @param initiator обьект персонажаы
   * @param target обьект цели магии
   * @todo тут нужен вывод требуемых параметров
   */
  next(initiator: Player, target: Player): void {
    const bl = this.params.game.battleLog;
    bl.success({
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      effect: this.effect,
    });
    this.params = null;
  }
}
