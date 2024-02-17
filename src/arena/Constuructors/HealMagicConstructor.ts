import { floatNumber } from '../../utils/floatNumber';
import type Game from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import { AffectableAction } from './AffectableAction';
import type {
  ActionType, CustomMessage, OrderType,
} from './types';

export interface HealArgs {
  name: string;
  displayName: string;
  desc: string;
  lvl: number;
  orderType: OrderType;
}

export interface Heal extends HealArgs, CustomMessage {
}
/**
 * Heal Class
 */
export abstract class Heal extends AffectableAction {
  actionType: ActionType = 'heal';

  constructor(params: HealArgs) {
    super();
    Object.assign(this, params);
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры (не обязателен)
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.params = {
      initiator, target, game,
    };

    try {
      this.checkPreAffects();
      this.run(initiator, target, game);
      // Получение экспы за хил следует вынести в отдельный action следующий
      // за самим хилом, дабы выдать exp всем хиллерам после формирования
      // общего массива хила
      this.getExp(initiator, target, game);
      // this.backToLife();
      this.next();
    } catch (e) {
      this.handleCastError(e);
    }
  }

  /**
   * Функция выполняет проверку, является ли хил "воскресившим", т.е если
   * цель до выполнения лечения имела статус "isDead", а после хила имеет хп > 0
   * Значит накидываем хилеру 1 голды :)
   */
  // backToLife() {}

  /**
   * Функция вычисления размера хила
   * @return размер хила
   */
  effectVal(): number {
    const { initiator, target } = this.params;
    const proc = initiator.proc ?? 0;
    const hl = initiator.stats.val('hl');
    const maxHp = target.stats.val('maxHp');
    const curHp = target.stats.val('hp');

    const allHeal = MiscService.randInt(hl.min, hl.max) * proc;
    const maxHeal = maxHp - curHp;
    const healEffect = Math.min(maxHeal, allHeal);

    return floatNumber(healEffect);
  }

  getExp(initiator: Player, target: Player, game: Game): void {
    if (game.isPlayersAlly(initiator, target)) {
      const healEffect = this.status.effect;
      const exp = Math.round(healEffect * 10);
      initiator.stats.up('exp', exp);
      this.status.exp = exp;
    } else {
      this.status.exp = 0;
    }

    this.status.expArr = [{
      id: initiator.id,
      name: initiator.nick,
      exp: this.status.exp,
      val: this.status.effect,
    }];
  }

  checkTargetIsDead({ target } = this.params) {
    const hpNow = target.stats.val('hp');
    if (hpNow > 0 && target.getKiller()) {
      target.resetKiller();
    }
  }
}
