import { LongMagic } from '../Constuructors/LongMagicConstructor';

/**
 * Малая аура
 * Основное описание магии общее требовани есть в конструкторе
 */
export class Aura extends LongMagic {
  run(): void {
    const { target } = this.params;
    target.stats.up('phys.defence', this.effectVal());
  }

  runLong(): void {
    const { target } = this.params;
    target.stats.up('phys.defence', this.effectVal());
  }
}
