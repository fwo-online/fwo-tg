import type { BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import CastError from '@/arena/errors/CastError';

const affectName = 'CHANCE_FAIL';

class DivineWill extends PassiveSkillConstructor implements Affect {
  constructor() {
    super({
      name: 'divineWill',
      displayName: 'Воля богов',
      description: 'Боги вмешиваются в исход заклинания, превращая провал в успех — или наоборот',
      chance: [5],
      effect: [0],
      bonusCost: [],
    });
  }

  run() {
    //
  }

  isActive(): boolean {
    return true;
  }

  getChance() {
    return this.chance[0];
  }

  preAffect: Affect['preAffect'] = (context): undefined => {
    this.applyContext(context);

    const { initiator, target, game } = context.params;
    if (this.checkChance()) {
      throw new CastError(this.getSuccessResult({ initiator, target, game }));
    }
  };

  affectHandler(
    params: BaseActionContext,
    affect: SuccessArgs | BreaksMessage,
  ): SuccessArgs | SuccessArgs[] | undefined {
    this.applyContext(params);

    if (affect !== affectName) {
      return;
    }

    if (this.checkChance()) {
      return this.getSuccessResult(this.context.params);
    }
  }
}

export default new DivineWill();
