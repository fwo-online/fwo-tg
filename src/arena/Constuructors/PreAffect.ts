import { Params } from './types';

export interface PreAffect {
  check(params: Params): never | void
}
