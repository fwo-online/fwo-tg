import { OrderType } from '@fwo/shared';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import CastError from '../errors/CastError';

/**
 * Безмолвие
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'silence',
  displayName: 'Безмолвие',
  desc: '',
  cost: 16,
  baseExp: 80,
  costType: 'mp',
  lvl: 4,
  orderType: OrderType.All,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d60+30', '1d30+55', '1d10+75'],
  profList: ['m'],
  effect: [],
});

class Silence extends CommonMagic {
  run() {
    const { initiator, target } = this.params;

    target.affects.addEffect({
      action: this.name,
      duration: 1,
      proc: initiator.proc,
      initiator,
      onBeforeRun({ params: { initiator, target, game } }) {
        return silenceEffect.cast(initiator, target, game);
      },
    });
  }
}

export class SilenceEffect extends CommonMagic {
  override cast(initiator: Player, target: Player, game: GameService): undefined {
    this.createContext(initiator, target, game);
    this.run();
  }

  run() {
    const { target, game } = this.params;
    const effects = target.affects.getEffectsByAction(this.name);

    if (!effects.length) {
      return;
    }

    throw new CastError(
      effects.map(({ initiator }) => this.getSuccessResult({ initiator, target, game })),
    );
  }
}

export const silenceEffect = new SilenceEffect(params);
export const silence = new Silence(params);
