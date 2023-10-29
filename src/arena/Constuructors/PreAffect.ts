import { Breaks, Params } from './types';

export interface PreAffect {
  check(params: Params): Breaks | void
}
