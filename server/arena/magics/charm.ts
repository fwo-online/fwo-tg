import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';

class Charm extends CommonMagic implements Affect {
  constructor() {
    super({
      name: 'charm',
      displayName: 'Очарование',
      desc: 'Заставляет цель атаковать своих союзников',
      cost: 18,
      baseExp: 80,
      costType: 'mp',
      lvl: 3,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d10+75', '1d20+80', '1d20+85'],
      profList: [],
      effect: [],
    });
  }

  run() {
    const { initiator, target } = this.params;
    target.flags.isCharmed.push({ initiator, val: 0 });
  }

  preAffect: Affect['preAffect'] = (context) => {
    const { initiator, game } = context.params;
    if (initiator.flags.isCharmed.length) {
      context.params.target = game.players.getAliveAllies(initiator).at(0) ?? initiator;

      return initiator.flags.isCharmed.map(({ initiator }) =>
        this.getSuccessResult({
          ...context.params,
          initiator,
        }),
      );
    }
  };
}

export default new Charm();
