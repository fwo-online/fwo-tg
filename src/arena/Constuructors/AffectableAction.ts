import { BaseAction } from './BaseAction';
import type { PostAffect } from './interfaces/PostAffect';
import type { PreAffect } from './interfaces/PreAffect';
import type { SuccessArgs } from './types';

export abstract class AffectableAction extends BaseAction {
  private preAffects: PreAffect[] = [];
  private postAffects: PostAffect[] = [];
  private affects: SuccessArgs[] = [];

  registerPreAffects(preAffects: PreAffect[]) {
    this.preAffects = preAffects;
  }

  registerPostAffects(postAffects: PostAffect[]) {
    this.postAffects = postAffects;
  }

  checkPreAffects(params = this.params, status = this.status) {
    this.preAffects.forEach((preAffect) => {
      preAffect.preAffect(params, status);
    });
  }

  checkPostAffects(params = this.params, status = this.status) {
    this.postAffects.forEach((preAffect) => {
      const result = preAffect.postAffect(params, status);
      if (!result) {
        return;
      }

      const normalizedResult = Array.isArray(result) ? result : [result];

      this.affects.push(...normalizedResult);
    });
  }

  getAffects() {
    return this.affects;
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
