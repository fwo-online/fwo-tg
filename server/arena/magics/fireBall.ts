import { OrderType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import { times } from 'lodash';
import { effectService } from '@/arena/EffectService';
import { AoeDmgMagic } from '../Constuructors/AoeDmgMagicConstructor';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';

class FireBall extends AoeDmgMagic {
  bounces = 4;
  aoeEffect = '1d2';

  constructor() {
    super({
      name: 'fireBall',
      displayName: 'Огненный шар',
      desc: 'Огненный шар',
      cost: 24,
      baseExp: 10,
      costType: 'mp',
      lvl: 5,
      orderType: OrderType.Enemy,
      aoeType: 'team',
      magType: 'bad',
      chance: [95, 95, 95],
      effect: ['1d3+5', '1d3+6', '1d3+7'],
      dmgType: 'fire',
      profList: ['m'],
    });
  }

  getTargets(): Player[] {
    const { target, game } = this.params;

    if (!target.clan) {
      return [target];
    }

    const targetAllies = shuffle(game.players.getAliveAllies(target));

    if (!targetAllies.length) {
      return [target];
    }

    return targetAllies;
  }

  run(): void {
    const { initiator, game } = this.context;
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);

    const targets = this.getTargets();

    times(this.bounces).forEach((value) => {
      const target = targets[value % targets.length];
      const context = this.context.cloneWith(target);
      context.status.effect = this.aoeEffectVal({ initiator, target, game });

      const val = effectService.rawDamage(context, this);

      this.status.expArr.push({
        initiator,
        target,
        val,
        hp: target.stats.val('hp'),
      });
    });
  }

  aoeEffectVal({ initiator, target, game } = this.params): number {
    const effect = MiscService.dice(this.aoeEffect) * initiator.proc;
    return this.modifyEffect(effect, { initiator, target, game });
  }
}

export default new FireBall();
