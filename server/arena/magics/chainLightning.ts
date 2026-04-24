import { OrderType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import { effectService } from '@/arena/EffectService';
import { AoeDmgMagic } from '../Constuructors/AoeDmgMagicConstructor';

/**
 * Цепь молний
 * Основное описание магии общее требовани есть в конструкторе
 */
class ChainLightning extends AoeDmgMagic {
  constructor() {
    super({
      name: 'chainLightning',
      displayName: 'Цепь молний',
      desc: 'Цепная молния повреждает выбранную цель молнией и еще одну случайно.',
      cost: 8,
      baseExp: 12,
      costType: 'mp',
      lvl: 3,
      orderType: OrderType.Any,
      aoeType: 'targetAoe',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d3+1', '1d3+2', '1d3+3'],
      dmgType: 'lighting',
      profList: ['m'],
    });
  }

  maxTargets = [3, 4, 5];

  getTargets() {
    const { initiator, target, game } = this.params;
    const magicLevel = initiator.getMagicLevel(this.name);
    const maxTargets = this.maxTargets[magicLevel - 1];

    const targetAllies = shuffle(game.players.getAliveAllies(target));
    const targetEnemies = shuffle(game.players.getAliveEnemies(target));

    return [...targetAllies, ...targetEnemies]
      .filter(({ id }) => id !== initiator.id)
      .slice(0, maxTargets - 1);
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { initiator, game } = this.context;
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);

    const targets = this.getTargets();
    targets.forEach((target, index) => {
      const multiplier = 1 - (index + 1) * 0.1; // -10% каждой следующей цели
      const context = this.context.cloneWith(target);

      context.status.effect = this.effectVal({ initiator, target, game }) * multiplier;
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
    const effect = this.getEffectVal({ initiator, target, game });
    return this.modifyEffect(effect, { initiator, target, game });
  }
}

export default new ChainLightning();
