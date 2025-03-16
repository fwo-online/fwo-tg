import type { Affect } from '../Constuructors/interfaces/Affect';
import PhysConstructor from '../Constuructors/PhysConstructor';
import CastError from '../errors/CastError';
/**
 * Физическая атака
 */
class Attack extends PhysConstructor implements Affect {
  constructor() {
    super({
      name: 'attack',
      displayName: 'Атака',
      desc: 'Атака',
      lvl: 0,
      orderType: 'all',
    });
  }

  /**
 * Кастомный обработчик атаки
 */
  run() {
    if (!this.params) {
      return;
    }
    const { initiator, target } = this.params;

    target.flags.isHited = {
      initiator: initiator.nick, val: this.status.effect,
    };

    target.stats.down('hp', this.status.effect);
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator, target, game } }): undefined => {
    if (target.flags.isHited) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  };
}
export default new Attack();
