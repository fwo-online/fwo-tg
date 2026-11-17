import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import { LongMagic } from '../Constuructors/LongMagicConstructor';

/**
 * Малая аура
 * Основное описание магии общее требовани есть в конструкторе
 */

export abstract class Aura extends CommonMagic {
  abstract effectInstanse: AuraEffect;

  run(): void {
    const { initiator, target } = this.params;
    target.affects.addLongEffect({
      action: this.name,
      initiator,
      duration: initiator.stats.val('spellLength'),
      proc: initiator.proc,
      onCast: (game, affect) => {
        this.effectInstanse.castLongEffect(initiator, target, game, affect);
      },
    });
  }
}

export class AuraEffect extends LongMagic {
  run(): void {
    const { target } = this.params;
    target.stats.up('phys.defence', this.effectVal());
  }
}
