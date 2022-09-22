import { bold, italic } from '../../utils/formatString';
import { LongDmgMagic } from '../Constuructors/LongDmgMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Ледяное прикосновение
 * Основное описание магии общее требовани есть в конструкторе
 */
class FrostTouch extends LongDmgMagic {
  private case = 'Ледяным прикосновением';

  constructor() {
    super({
      name: 'frostTouch',
      displayName: 'Ледяное прикосновение',
      desc: 'Поражает цель ледяным касанием, отнимая жизни. (длительная)',
      cost: 3,
      baseExp: 16,
      costType: 'mp',
      lvl: 1,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+1', '1d2+2'],
      dmgType: 'frost',
      profList: ['m'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('down', 'hp', this.effectVal());
  }

  runLong() {
    const { target } = this.params;
    target.stats.mode('down', 'hp', this.effectVal());
  }

  customMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    return `${bold(initiator)} поражает ${bold(target)} ${italic(this.case)}`;
  }

  longCustomMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    return `${italic(this.displayName)} (${bold(initiator)}) отнимает жизни у игрока ${bold(target)}`;
  }
}

export default new FrostTouch();
