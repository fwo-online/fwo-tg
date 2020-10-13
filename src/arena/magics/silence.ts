import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Безмолвие
 * Основное описание магии общее требовани есть в конструкторе
 */
class Silence extends CommonMagic {
  constructor() {
    super({
      name: 'silence',
      displayName: 'Безмолвие',
      desc: '',
      cost: 16,
      baseExp: 80,
      costType: 'mp',
      lvl: 4,
      orderType: 'all',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d60', '1d70', '1d85'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    const { initiator, target } = this.params;
    target.flags.isSilenced.push({
      initiator: initiator.nick,
      val: 0,
    });
  }
}

export default new Silence();
