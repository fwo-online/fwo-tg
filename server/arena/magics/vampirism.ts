import type { SuccessArgs } from '@/arena/Constuructors/types';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
import { bold, italic } from '@/utils/formatString';

/**
 * Вампиризм
 * Основное описание магии общее требовани есть в конструкторе
 */
class Vampirism extends DmgMagic {
  constructor() {
    super({
      name: 'vampirism',
      displayName: 'Вампиризм',
      desc: 'Возвращает часть нанесеного урона в качесте жизней',
      cost: 12,
      baseExp: 10,
      costType: 'mp',
      lvl: 3,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2+1', '1d2+2', '1d2+3'],
      dmgType: 'clear',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { target, initiator } = this.params;
    const effect = this.effectVal();
    const maxHeal = target.stats.val('hp');

    target.stats.down('hp', effect);
    initiator.stats.up('hp', Math.min(effect, Math.max(0, maxHeal))); // хилим только на урон до 0 хп
  }

  customMessage({ initiator, target, effect, hp }: SuccessArgs): string {
    const heal = Math.max(0, effect - Math.abs(Math.min(0, hp)));
    return `${bold(initiator.nick)} сотворил ${italic(this.displayName)} на ${bold(target.nick)} нанеся ${bold(effect.toString())} и восстановив себе ${bold(heal.toString())} здоровья`;
  }
}

export default new Vampirism();
