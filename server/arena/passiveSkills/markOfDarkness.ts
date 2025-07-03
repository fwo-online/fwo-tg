import type { Affect, AffectFn } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';

export class MarkOfDarkness extends PassiveSkillConstructor implements Affect {
  constructor() {
    super({
      name: 'markOfDarkness',
      displayName: '🌑 Метка тьмы',
      description: 'Накладывает метку на врагов во время затмения',
      chance: [80, 85, 90, 95, 100],
      effect: [1.2, 1.4, 1.6, 1.8, 2],
      bonusCost: [],
    });
  }

  run() {
    this.initiator.proc *= this.getEffect();
  }

  preAffect?: AffectFn | undefined = (context) => {
    this.applyContext(context);

    if (!this.isActive()) {
      return;
    }

    if (!this.target.flags.isMarkedByDarkness.length) {
      return;
    }

    this.run();

    return this.target.flags.isMarkedByDarkness.map(({ initiator }) => {
      return this.getSuccessResult({ ...this.params, initiator });
    });
  };

  postAffect?: AffectFn | undefined = (context) => {
    this.applyContext(context);
    this.swapParams();

    if (!this.isActive()) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    if (!this.game.flags.global.isEclipsed.length) {
      return;
    }

    return this.game.players.getAliveEnemies(this.initiator).map((target) => {
      target.flags.isMarkedByDarkness.push({ initiator: this.initiator, val: 0 });
      return this.getSuccessResult({
        ...this.params,
        target,
      });
    });
  };
}

export default new MarkOfDarkness();
