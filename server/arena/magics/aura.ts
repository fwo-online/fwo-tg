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
    target.affects.addEffect({
      action: this.name,
      initiator,
      value: 0,
      duration: initiator.stats.val('spellLength'),
      onCast: ({ initiator, target, game }) => {
        this.effectInstanse.cast(initiator, target, game);
      },
    });
    target.stats.up('phys.defence', this.effectVal());
  }

  runLong(): void {
    const { target } = this.params;
    target.stats.up('phys.defence', this.effectVal());
  }
}

export class AuraEffect extends LongMagic {
  run(): void {
    const { target } = this.params;
    target.stats.up('phys.defence', this.effectVal());
  }
}
