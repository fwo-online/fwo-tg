import type { ActionType } from '@fwo/shared';
import { WithLongEffect } from '@/arena/Constuructors/mixins/WithLongEffect';
import { CommonMagic } from './CommonMagicConstructor';

/**
 * Общий конструктор не длительных магий
 */
export abstract class LongMagic extends WithLongEffect(CommonMagic) {
  actionType: ActionType = 'magic-long';

  /**
   * Для длителных бафов exp считаем по BaseExp*effect
   */
  override getEffectExp(effect: number, baseExp = 0) {
    return Math.round((baseExp * this.params.initiator.proc * effect) / 4);
  }
}

/**
 * [ибо 2,3,4 из 6] Эридан окутался <Сильной аурой> и
 * повысил свою защиту на 30.49pt. (e:+30/83)
 * [1 из 6] Эридан окутался <Аурой> и повысил свою
 * защиту на 1.63pt. (e:+2/84)
 * [4/7] ReaL заклинанием <Магическая стена> поднял
 *  защиту Mst на 329.57pt. (e:+33/638)
 */
