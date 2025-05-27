import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { LongDmgMagic } from '@/arena/Constuructors/LongDmgMagicConstructor';
import MiscService from '@/arena/MiscService';

class Bleeding extends LongDmgMagic {
  constructor() {
    super({
      name: 'bleeding',
      displayName: '🩸 Кровотечение',
      desc: 'Кровотечение наносит урон в течение нескольких ходов',
      cost: 0,
      baseExp: 0,
      costType: 'mp',
      lvl: 4,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [100, 100, 100],
      effect: ['1d3', '1d7', '1d12'],
      dmgType: 'physical',
      profList: ['w'],
    });
  }

  getChance(): number {
    const magicLvl = this.params.initiator.getMagicLevel(this.name);
    return this.chance[magicLvl - 1] as number;
  }

  shouldClearDebuff(effect: number): boolean {
    const { target } = this.params;
    if (!target.flags.isHealed.length) {
      return false;
    }

    const heal = target.flags.isHealed.reduce((acc, cur) => acc + cur.val, 0);
    return effect < heal / 2;
  }

  clearDebuff() {
    const { target, game } = this.params;

    game.longActions[this.name] = game.longActions[this.name]?.filter(
      (item) => item.target !== target.id,
    );
  }

  run() {
    const { target } = this.params;
    const effect = this.effectVal();
    if (this.shouldClearDebuff(effect)) {
      this.clearDebuff();
      return;
    }
    this.status.effect = effect;
    target.stats.down('hp', this.status.effect);
  }

  runLong() {
    const { target } = this.params;
    const effect = this.effectVal();
    if (this.shouldClearDebuff(effect)) {
      this.clearDebuff();
      return;
    }
    this.status.effect = effect;
    target.stats.down('hp', this.status.effect);
  }

  postAffect: Affect['postAffect'] = (context): undefined => {
    this.applyContext(context);

    if (!this.params.initiator.getMagicLevel(this.name)) {
      return;
    }

    if (MiscService.rndm('1d100') > this.getChance()) {
      return;
    }

    if (!this.params.initiator.weapon.isOfType(['cut'])) {
      return;
    }

    const { initiator, target, game } = this.params;
    this.cast(initiator, target, game);
  };
}

export default new Bleeding();
