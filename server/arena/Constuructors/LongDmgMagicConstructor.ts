import { WithLongEffect } from '@/arena/Constuructors/mixins/WithLongEffect';
import { DmgMagic } from './DmgMagicConstructor';
import type { ActionType } from './types';

/**
 * Общий конструктор не длительных магий
 */
export abstract class LongDmgMagic extends WithLongEffect(DmgMagic) {
  actionType: ActionType = 'dmg-magic-long';
}
