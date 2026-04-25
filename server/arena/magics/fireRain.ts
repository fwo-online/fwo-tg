import { OrderType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import { effectService } from '@/arena/EffectService';
import { AoeDmgMagic } from '../Constuructors/AoeDmgMagicConstructor';

/**
 * Огненный дождь
 * Основное описание магии общее требовани есть в конструкторе
 */
class FireRain extends AoeDmgMagic {
  constructor() {
    super({
      name: 'fireRain',
      displayName: 'Огненный дождь',
      desc: 'Обрушивает на команду противника огненный дождь',
      cost: 18,
      baseExp: 8,
      costType: 'mp',
      lvl: 3,
      orderType: OrderType.Enemy,
      aoeType: 'team',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+2', '1d2+4'],
      dmgType: 'fire',
      profList: ['m'],
    });
  }

  getTargets() {
    const { target, game } = this.params;

    return shuffle(game.players.getAliveAllies(target));
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { initiator, game } = this.context;
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);

    const targets = this.getTargets();

    targets.forEach((target) => {
      const context = this.context.cloneWith(target);
      context.status.effect = this.effectVal({ initiator, target, game });

      const val = effectService.rawDamage(context, this);

      this.status.expArr.push({
        initiator,
        target: context.target,
        val,
        hp: context.target.stats.val('hp'),
      });
    });
  }
}

export default new FireRain();
