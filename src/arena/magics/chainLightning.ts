import { floatNumber } from '@/utils/floatNumber';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
import { MagicNext } from '../Constuructors/MagicConstructor';
import { ExpArr } from '../Constuructors/types';
/**
 * Цепь молний
 * Основное описание магии общее требовани есть в конструкторе
 */

class ChainLightning extends DmgMagic {
  static maxTargets = [3, 4, 5];

  override status: {
    exp: number;
    expArr: ExpArr;
    hit: number;
  } = {
      exp: 0,
      hit: 0,
      expArr: [],
    };

  constructor() {
    super({
      name: 'chainLightning',
      displayName: 'Цепь молний',
      desc: 'Цепная молния повреждает выбранную цель молнией и еще одну случайно.',
      cost: 8,
      baseExp: 12,
      costType: 'mp',
      lvl: 3,
      orderType: 'any',
      aoeType: 'targetAoe',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d3+1', '1d3+2', '1d3+3'],
      dmgType: 'lighting',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { initiator, target, game } = this.params;
    const hit = this.effectVal();
    target.stats.down('hp', hit);

    const magicLevel = initiator.getMagicLevel(this.name);

    const maxTargets = ChainLightning.maxTargets[magicLevel - 1];

    const targets = game.players.getMyTeam(target.id)
      .filter(({ id }) => id !== target.id)
      .slice(0, maxTargets - 1);

    targets.forEach((target, index) => {
      const multiplier = 1 - (index + 1) * 0.1; // -10% каждой следующей цели
      const hit = floatNumber(this.effectVal({ initiator, target, game }, false) * multiplier);

      target.stats.down('hp', hit);

      this.status.hit = hit;
      const exp = this.getExp({ initiator, target, game }, false);

      this.status.expArr.push({
        name: target.nick,
        exp,
        val: hit,
        hp: target.stats.val('hp'),
      });
    });

    this.status.hit = hit;
  }

  checkTargetIsDead({ initiator, game } = this.params): void {
    this.status.expArr.forEach(({ name }) => {
      const target = game.players.getById(name);

      if (!target) {
        return;
      }

      super.checkTargetIsDead({ initiator, target, game });
    });
  }

  override getNextArgs(): MagicNext & { expArr: ExpArr } {
    return {
      ...super.getNextArgs(),
      expArr: this.status.expArr,
    };
  }

  next(): void {
    super.next();

    this.status = {
      exp: 0,
      hit: 0,
      expArr: [],
    };
  }
}

export default new ChainLightning();
