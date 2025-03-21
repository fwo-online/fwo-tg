import { floatNumber } from '@/utils/floatNumber';
import CastError from '../errors/CastError';
import type GameService from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import { AffectableAction } from './AffectableAction';
import type { ActionType, DamageType, OrderType } from './types';

/**
 * Конструктор физической атаки
 * (возможно физ скилы)
 * @todo Сейчас при отсутствие защиты на цели, не учитывается статик протект(
 * ???) Т.е если цель не защищается атака по ней на 95% удачна
 * */
export default abstract class PhysConstructor extends AffectableAction {
  name: string;
  displayName: string;
  desc: string;
  lvl: number;
  orderType: OrderType;
  actionType: ActionType = 'phys';
  effectType: DamageType = 'physical';

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
      this.checkPreAffects();

      this.run(initiator, target, game);
      this.calculateExp();

      this.checkPostAffects();
      this.checkTargetIsDead();
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

  /**
   * Проверка прохождения защиты цели
   * Если проверка провалена, выставляем флаг isHited, означающий что
   * атака прошла
   */
  calculateHit() {
    const { initiator, target } = this.params;

    const { min, max } = initiator.stats.val('hit');
    const hit = MiscService.randFloat(min, max);

    const effect = this.applyResists(hit, target);
    this.status.effect = floatNumber(effect * initiator.proc);
  }

  applyResists(effect: number, target: Player): number {
    const resist = target.resists[this.effectType];
    if (resist) {
      return effect * resist;
    }
    return effect;
  }

  /**
   * Рассчитываем полученный exp
   */
  calculateExp({ initiator, target } = this.params) {
    if (initiator.isAlly(target) && !initiator.flags.isGlitched.length) {
      this.status.exp = 0;
    } else {
      this.status.exp = Math.round(this.status.effect * 8);
    }
  }

  /**
   * Проверка убита ли цель
   * @todo после того как был нанесен урон любым dmg action, следует производить
   * общую проверку
   */
  checkTargetIsDead() {
    const { initiator, target } = this.params;
    const hpNow = target.stats.val('hp');
    if (hpNow <= 0 && !target.getKiller()) {
      target.setKiller(initiator);
    }
  }
}
