import type { Item } from '../../models/item';
import type { SuccessArgs } from '../BattleLog';
import type { DmgMagicNext } from './DmgMagicConstructor';
import type { LongDmgMagicNext } from './LongDmgMagicConstructor';
import type { LongMagicNext } from './LongMagicConstructor';
import type { MagicNext } from './MagicConstructor';
import type { SkillNext } from './SkillConstructor';

export type CostType = 'en' | 'mp';
export type OrderType = 'all' | 'any' | 'enemy' | 'self';
export type AOEType = 'target' | 'team';
export type ActionType = 'magic' | 'heal' | 'phys' | 'skill' | 'long';
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

export type CustomMessageFn = (args: SuccessArgs) => string;

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

export type BaseNext = {
  action: string;
  exp: number;
  initiator: string;
  target: string;
  msg?: CustomMessageFn;
}

export type PhysNext = BaseNext & {
  actionType: 'phys';
  dmg: number;
  hp: number;
  weapon: Item;
  dmgType: DamageType,
}

export type ExpArr = readonly [name: string, exp: number, heal?: number];

export type PostHealNext = Omit<BaseNext, 'initiator'> & {
  actionType: 'post-heal';
  action: string;
  target: string;
  effect: number,
  expArr: ExpArr[];
}

export type HealNext = BaseNext & {
  actionType: 'heal';
  effect: number;
}

export type NextArgs =
  MagicNext |
  DmgMagicNext |
  LongDmgMagicNext |
  LongMagicNext |
  SkillNext |
  PhysNext |
  PostHealNext |
  HealNext;
