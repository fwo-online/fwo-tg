import { floatNumber } from '@/utils/floatNumber';
import CastError from '../errors/CastError';
import type GameService from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import { AffectableAction } from './AffectableAction';
import type {
  ActionType, DamageType, OrderType,
} from './types';

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
  effectType?: DamageType | undefined = 'physical';

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
    this.params = {
      initiator, target, game,
    };
    this.reset();

    try {
      this.fitsCheck();
      this.calculateHit();
      this.checkPreAffects();
      this.isBlurredMind();

      this.run(initiator, target, game);
      this.getExp();

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
   * Проверка флагов влияющих на выбор цели
   */
  isBlurredMind() {
    const { initiator, game } = this.params;
    if (initiator.flags.isGlitched) {
      // Меняем цель внутри атаки на любого живого в игре
      this.params.target = game.players.randomAlive;
    }
    if (initiator.flags.isMad) {
      this.params.target = initiator;
    }
  }

  /**
   * Проверка прохождения защиты цели
   * Если проверка провалена, выставляем флаг isHited, означающий что
   * атака прошла
   */
  calculateHit() {
    const { initiator } = this.params;

    const initiatorHitParam = initiator.stats.val('hit');
    const hitval = MiscService.randInt(
      initiatorHitParam.min,
      initiatorHitParam.max,
    );
    this.status.effect = floatNumber(hitval * initiator.proc);
  }

  /**
   * Рассчитываем полученный exp
   */
  getExp({ initiator, target, game } = this.params) {
    if (game.isPlayersAlly(initiator, target) && !initiator.flags.isGlitched) {
      this.status.exp = 0;
    } else {
      const exp = this.status.effect * 8;
      this.status.exp = Math.round(exp);
      initiator.stats.up('exp', this.status.exp);
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
