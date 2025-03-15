import type { Action } from './action';

export type Order = {
  target: string;
  action: Action;
  power: number;
};
