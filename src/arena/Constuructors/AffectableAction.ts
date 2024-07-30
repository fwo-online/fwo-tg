import { normalizeToArray } from '@/utils/array';
import { BaseAction } from './BaseAction';
import type { Affect, AffectFn } from './interfaces/Affect';
import type { SuccessArgs } from './types';

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

  checkPreAffects(params = this.params, status = this.status) {
    this.preAffects.forEach((preAffect) => {
      this.handleAffect(preAffect.preAffect, params, status);
    });
  }

  checkPostAffects(params = this.params, status = this.status) {
    this.postAffects.forEach((postAffect) => {
      this.handleAffect(postAffect.postAffect, params, status);
    });
  }

  private handleAffect(affectMethod?: AffectFn, params = this.params, status = this.status) {
    try {
      this.addAffects(affectMethod?.(params, status));
    } catch (e) {
      const handlerResult = this.checkAffectHandlers(this.params, e.reason);
      if (!handlerResult) {
        throw e;
      }
    }
  }

  checkAffectHandlers(params = this.params, result: SuccessArgs | SuccessArgs[] = []) {
    const [normalizedResult] = normalizeToArray(result);

    for (const affectHandler of this.affectHandlers) {
      const handlerResult = affectHandler.affectHandler?.(params, normalizedResult);

      if (handlerResult) {
        this.addAffects(handlerResult);
        return true;
      }
    }
    return false;
  }

  private addAffects(affects: void | SuccessArgs | SuccessArgs[]) {
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
