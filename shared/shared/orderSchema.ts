import type { Action } from './action';

export type Order = {
  id: string;
  target: string;
  action: Action;
  power: number;
};
