import { EffectType } from '@fwo/shared';
import { BaseAction } from '@/arena/Constuructors/BaseAction';
import { floatNumber } from '@/utils/floatNumber';
import CastError from '../errors/CastError';
import type GameService from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import type { ActionType } from './types';

/**
 * Конструктор физической атаки
 * (возможно физ скилы)
 * @todo Сейчас при отсутствие защиты на цели, не учитывается статик протект(
 * ???) Т.е если цель не защищается атака по ней на 95% удачна
 * */
export default abstract class PhysConstructor extends BaseAction {
  displayName: string;
  desc: string;
  lvl: number;
  actionType: ActionType = 'phys';
  effectType = EffectType.Physical;

  constructor(atkAct) {
    super();

    this.name = atkAct.name;
    this.displayName = atkAct.displayName;
    this.desc = atkAct.desc;
    this.lvl = atkAct.lvl;
    this.orderType = atkAct.orderType;
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод для скилов физической атаки
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры
   */
  cast(initiator: Player, target: Player, game: GameService) {
    this.createContext(initiator, target, game);

    try {
      this.fitsCheck();
      this.calculateHit();

      this.onBeforeRun();
      this.run(initiator, target, game);
      this.calculateExp();

      this.next();
    } catch (e) {
      this.handleCastError(e);
    }
  }

  /**
   * Проверка флагов влияющих на физический урон
   */
  fitsCheck() {
    const { initiator } = this.params;
    if (!initiator.weapon.hasWeapon()) {
      throw new CastError('NO_WEAPON');
    }
  }

  calculateHit() {
    const { initiator } = this.params;

    const { min, max } = initiator.stats.val('hit');
    const hit = MiscService.randFloat(min, max);

    this.status.effect = floatNumber(hit * initiator.proc);
  }

  /**
   * Рассчитываем полученный exp
   */
  calculateExp({ initiator, target } = this.params) {
    const effects = initiator.affects.getEffectsByAction('glitch');
    if (initiator.isAlly(target) && !effects.length) {
      this.status.exp = 0;
    } else {
      this.status.exp = Math.round(this.status.effect * 8);
    }
  }
}
