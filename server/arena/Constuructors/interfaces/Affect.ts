import type { BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';

type AffectResult = SuccessArgs | SuccessArgs[] | undefined;

export type AffectFn = (context: BaseActionContext) => AffectResult;

export interface Affect {
  preAffect?: AffectFn;
  postAffect?: AffectFn;

  affectHandler?(params: BaseActionContext, affect: SuccessArgs | BreaksMessage): AffectResult;
}
