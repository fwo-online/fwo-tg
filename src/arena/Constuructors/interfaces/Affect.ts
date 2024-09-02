import type { BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { SuccessArgs } from '@/arena/Constuructors/types';

type AffectResult = SuccessArgs | SuccessArgs[] | void;

export type AffectFn = (context: BaseActionContext) => AffectResult

export interface Affect {
  preAffect?: AffectFn;
  postAffect?: AffectFn;

  affectHandler?(
    params: BaseActionContext,
    affect: SuccessArgs | SuccessArgs[]
  ): AffectResult;
}
