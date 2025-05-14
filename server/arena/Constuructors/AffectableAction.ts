import { normalizeToArray } from '@/utils/array';
import { BaseAction } from './BaseAction';
import type { Affect, AffectFn } from './interfaces/Affect';
import type { SuccessArgs } from './types';
import CastError from '@/arena/errors/CastError';

export abstract class AffectableAction extends BaseAction {
  private preAffects: Affect[] = [];
  private postAffects: Affect[] = [];
  private affectHandlers: Affect[] = [];
  private affects: SuccessArgs[] = [];

  registerPreAffects(preAffects: Affect[]) {
    this.preAffects = preAffects;
  }

  registerPostAffects(postAffects: Affect[]) {
    this.postAffects = postAffects;
  }

  registerAffectHandlers(affectHandlers: Affect[]) {
    this.affectHandlers = affectHandlers;
  }

  clearAffects() {
    this.preAffects = [];
    this.postAffects = [];
    this.affectHandlers = [];
  }

  checkPreAffects() {
    this.preAffects.forEach((affect) => {
      this.handleAffect(affect.preAffect);
    });
  }

  checkPostAffects() {
    this.postAffects.forEach((affect) => {
      this.handleAffect(affect.postAffect);
    });
  }

  handleAffect(affectMethod?: AffectFn) {
    try {
      this.addAffects(affectMethod?.(this.context));
    } catch (error) {
      if (error instanceof CastError) {
        this.checkAffectHandlers(error);
      }
    }
  }

  checkAffectHandlers(error: CastError) {
    const [normalizedResult] = normalizeToArray(error.reason);

    for (const affectHandler of this.affectHandlers) {
      const handlerResult = affectHandler.affectHandler?.(this.context, normalizedResult);

      if (handlerResult) {
        this.addAffects(handlerResult);
        return;
      }
    }
    throw error;
  }

  private addAffects(affects: undefined | SuccessArgs | SuccessArgs[]) {
    if (!affects) {
      return;
    }

    if (Array.isArray(affects)) {
      this.affects.push(...affects);
    } else {
      this.affects.push(affects);
    }
  }

  getSuccessResult(params = this.params): SuccessArgs {
    return {
      ...super.getSuccessResult(params),
      affects: this.affects,
    };
  }

  reset() {
    super.reset();
    this.affects = [];
  }
}
