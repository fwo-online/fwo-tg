import { floatNumber } from '../../utils/floatNumber';
import type Game from '../GameService';
import type * as magics from '../magics';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import type {
  BaseNext, Breaks, BreaksMessage, CustomMessage,
} from './types';

export type MagicNext = BaseNext & {
  actionType: 'magic';
  effect?: number;
}

export interface MagicArgs {
  name: keyof typeof magics;
  displayName: string;
  desc: string;
  cost: number;
  costType: 'mp' | 'en';
  lvl: number;
  orderType: 'all' | 'any' | 'enemy' | 'self';
  aoeType: 'target' | 'team' | 'targetAoe';
  baseExp: number;
  effect: string[];
  magType: 'bad' | 'good';
  chance: number[] | string[];
  profList: string[];
}

/**
 * Конструктор магии
 */
export interface Magic extends MagicArgs, CustomMessage {
}

export abstract class Magic {
  params!: {
    initiator: Player;
    target: Player;
    game: Game;
  };

  status: {
    exp: number;
    effect?: number;
  };

  isLong = false;

  /**
   * Создание магии
   * @param magObj Объект создаваемой магии
   */
  constructor(magObj: MagicArgs) {
    Object.assign(this, magObj);
    this.status = {
      exp: 0,
    };
  }

  // Дальше идут общие методы для всех магий
  /**
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.params = {
      initiator, target, game,
    };
    try {
      this.getCost(initiator);
      this.checkPreAffects(initiator, target, game);
      this.isBlurredMind(); // проверка не запудрило
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.getExp(initiator);
      this.checkTargetIsDead();
      this.next();
    } catch (failMsg) {
      const bl = this.params.game.battleLog;
      // @fixme прокидываем ошибку выше для длительных кастов
      if (this.isLong) throw (failMsg);
      bl.fail(failMsg);
    }
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param initiator Объект кастера
   */
  getCost(initiator: Player): void {
    const costValue = +initiator.stats.val(this.costType) - this.cost;
    console.log(initiator, 'MP:', costValue);
    if (costValue >= 0) {
      initiator.stats.set(this.costType, costValue);
    } else {
      throw this.breaks('NO_MANA');
    }
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param initiator Объект кастера
   */
  getExp(initiator: Player): void {
    this.status.exp = Math.round(this.baseExp * initiator.proc);
    initiator.stats.mode('up', 'exp', this.baseExp);
  }

  /**
   * Функция расчитывай размер эффект от магии по стандартным дайсам
   * @return dice число эффекта
   */
  effectVal(): number {
    const { initiator } = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    const x = MiscService.dice(this.effect[initiatorMagicLvl - 1]) * initiator.proc;
    this.status.effect = floatNumber(x);
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
      // Магия остается фейловой
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
   * @param initiator объект персонажа
   * @param target объект персонажа
   * @param game Объект игры для доступа ко всему
   */
  abstract run(initiator: Player, target: Player, game: Game): void

  /**
   * Проверка на запудривание мозгов
   * @todo нужно вынести этот метод в orders или к Players Obj
   */
  isBlurredMind(): void {
    const { initiator, game } = this.params;
    if (initiator.flags.isGlitched) {
      this.params.target = game.players.randomAlive;
    }
  }

  /**
   * Проверка на запудривание мозгов
   * @param initiator объект персонажа
   * @param _target объект цели магии
   * @param _game Объект игры для доступа ко всему
   * @todo нужно вынести этот метод в orders
   */
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  checkPreAffects(initiator: Player, _target: Player, _game: Game): void {
    const { isSilenced } = initiator.flags;
    if (isSilenced.some((e) => e.initiator !== this.name)) {
      // если кастер находится под безмолвием/бунтом богов
      throw this.breaks('SILENCED');
    }
  }

  /**
   * Проверка убита ли цель
   * @todo после того как был нанесен урон любым dmg action, следует производить
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
   * @return объект остановки магии
   */
  breaks(msg: BreaksMessage): Breaks {
    return {
      actionType: 'magic',
      message: msg,
      action: this.displayName,
      initiator: this.params.initiator.nick,
      target: this.params.target.nick,
    };
  }

  protected getNextArgs(): MagicNext {
    const { target, initiator } = this.params;
    return {
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      effect: this.status.effect,
      msg: this.customMessage?.bind(this),
    };
  }

  /**
   * Магия прошла удачно
   * @todo тут нужен вывод требуемых параметров
   */
  next(): void {
    const { battleLog } = this.params.game;
    battleLog.success(this.getNextArgs());
  }
}
