import { AoeDmgMagic } from '../Constuructors/AoeDmgMagicConstructor';
import { type ExpArr } from '../Constuructors/types';
import type GameService from '../GameService';
import { dice } from '../MiscService';
import { type Player } from '../PlayersService';

class FireBall extends AoeDmgMagic {
  override status: {
    exp: number;
    expArr: ExpArr;
    hit: number;
  } = {
      exp: 0,
      hit: 0,
      expArr: [],
    };

  bounces = 6;
  aoeEffect = '1d3+2';

  constructor() {
    super({
      name: 'fireBall',
      displayName: 'Огненный шар',
      desc: '',
      cost: 24,
      baseExp: 10,
      costType: 'mp',
      lvl: 5,
      orderType: 'enemy',
      aoeType: 'team',
      magType: 'bad',
      chance: [100, 100, 100],
      effect: ['1d3+7', '1d3+7', '1d3+7'],
      dmgType: 'fire',
      profList: ['m'],
    });
  }

  getTargets(): Player[] {
    const { target, game } = this.params;

    if (!target.clan) {
      return [target];
    }

    const targets = game.players.getPlayersByClan(target.clan.id)
      .filter(({ alive }) => alive)
      .filter(({ id }) => id !== target.id);

    if (!targets.length) {
      return [target];
    }

    return targets;
  }

  run(initiator: Player, target: Player, game: GameService): void {
    const effect = this.effectVal({ initiator, target, game });
    target.stats.down('hp', effect);

    this.runAoe(initiator, target, game);
  }

  runAoe(initiator: Player, target: Player, game: GameService) {
    const targets = this.getTargets();

    let { bounces } = this;

    while (bounces) {
      const target = targets[bounces % targets.length];
      const effect = this.aoeEffectVal({ initiator, target, game });

      target.stats.down('hp', effect);

      this.status.expArr.push({
        id: target.id,
        name: target.nick,
        val: effect,
        hp: target.stats.val('hp'),
      });

      bounces--;
    }
  }

  aoeEffectVal({ initiator, target, game } = this.params): number {
    const effect = dice(this.aoeEffect) * initiator.proc;
    return this.modifyEffect(effect, { initiator, target, game });
  }
}

export default new FireBall();
