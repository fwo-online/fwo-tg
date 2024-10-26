import { Magics } from '@/data';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';

/**
 * Кислотный плевок
 * Основное описание магии общее требовани есть в конструкторе
 */
class AcidSpittle extends DmgMagic {
  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { target } = this.params;
    target.stats.mode('down', 'hp', this.effectVal());
  }
}

export const acidSpittle = new AcidSpittle(Magics.baseParams.acidSpittle);
