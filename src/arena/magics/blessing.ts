import { bold } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 * @todo в старой арене на 3 лвл магии она становилась длительной
 */
class Blessing extends CommonMagic {
  constructor() {
    super({
      // @ts-expect-error не используется
      name: 'blessing',
      displayName: 'Благословление',
      desc: 'Благословляет цель увеличивая её параметры',
      cost: 3,
      baseExp: 8,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d4+2', '1d3+3', '1d2+4'],
      profList: ['p'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('up', 'patk', this.effectVal());
    target.stats.mode('up', 'pdef', this.effectVal());
  }

  // eslint-disable-next-line class-methods-use-this
  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    const effectStr = effect?.toString() || '';
    return `${bold(initiator)} благославляет ${bold(target)} на ${bold(effectStr)}pt`;
  }
}

export default new Blessing();
