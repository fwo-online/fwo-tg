import type { BaseActionParams } from '@/arena/Constuructors/BaseAction';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
import { DmgMagic } from './DmgMagicConstructor';
import type { ActionType, SuccessArgs } from './types';

export interface LongDmgMagic extends DmgMagic {}
/**
 * Общий конструктор не длительных магий
 */
export abstract class LongDmgMagic extends DmgMagic {
  actionType: ActionType = 'dmg-magic-long';
  isLong = true;
  duration = 0;

  /**
   * Добавляем в основной каст postRun для записи длительной магии в массив
   * @param initiator  initiator
   * @param target  target
   * @param game  Game
   */
  cast(initiator: Player, target: Player, game: Game): void {
    try {
      this.createContext(initiator, target, game);
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.calculateExp();
      this.checkTargetIsDead(); // проверка трупов в длительных магиях
      this.next({ initiator, target, game });
    } catch (failMsg) {
      this.handleCastError(failMsg);
    } finally {
      this.reset();
    }
  }

  override getSuccessResult(params?: BaseActionParams): SuccessArgs {
    return {
      ...super.getSuccessResult(params),
      duration: this.duration,
    };
  }
}
