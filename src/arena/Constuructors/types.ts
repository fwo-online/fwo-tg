import type { SuccessArgs } from '../BattleLog';

export type CostType = 'en' | 'mp';
export type OrderType = 'all' | 'any' | 'enemy' | 'self';
export type AOEType = 'target' | 'team';
export type ActionType = 'magic' | 'heal' | 'phys' | 'skill';
export type DamageType = 'acid' | 'fire' | 'lighting' | 'frost' | 'physical' | 'clear';
export type BreaksMessage =
  'NO_TARGET' |
  'NO_MANA' |
  'NO_ENERGY' |
  'SILENCED' |
  'CHANCE_FAIL' |
  'GOD_FAIL' |
  'HEAL_FAIL' |
  'SKILL_FAIL' |
  'DEF' |
  'DODGED' |
  'ECLIPSE' |
  'NO_WEAPON' |
  'PARALYSED';

export interface CustomMessage {
  customMessage?(args: SuccessArgs): string;
}

export interface LongCustomMessage extends CustomMessage {
  longCustomMessage?(args: SuccessArgs): string;
}

export interface Breaks {
  actionType: ActionType
  message: BreaksMessage;
  action: string;
  initiator: string;
  target: string;
}
