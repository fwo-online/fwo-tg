import type { Item } from '../../models/item';
import type { SuccessArgs } from '../BattleLog';
import type { DmgMagicNext } from './DmgMagicConstructor';
import type { HealNext } from './HealMagicConstructor';
import type { LongDmgMagicNext } from './LongDmgMagicConstructor';
import type { LongMagicNext } from './LongMagicConstructor';
import type { MagicNext } from './MagicConstructor';
import type { SkillNext } from './SkillConstructor';

export type CostType = 'en' | 'mp';
export type OrderType = 'all' | 'any' | 'enemy' | 'self';
export type AOEType = 'target' | 'team';
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
  'PARRYED' |
  'DISARM' |
  'PARALYSED';

export type ExpArr = {
  name: string,
  exp: number,
  val?: number
}[];

export type CustomMessageFn = (args: SuccessArgs) => string;

export interface CustomMessage {
  customMessage?(args: SuccessArgs): string;
}

export interface LongCustomMessage extends CustomMessage {
  longCustomMessage?(args: SuccessArgs): string;
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

export type PhysBreak = Omit<BaseNext, 'exp'> & {
  actionType: 'phys';
  message: BreaksMessage;
  weapon: Item;
  expArr: ExpArr;
}

export type NextArgs =
  MagicNext |
  DmgMagicNext |
  LongDmgMagicNext |
  LongMagicNext |
  SkillNext |
  PhysNext |
  HealNext;

export type ActionType = NextArgs['actionType'];

export interface Breaks {
  actionType: ActionType;
  message: BreaksMessage;
  action: string;
  initiator: string;
  target: string;
}
