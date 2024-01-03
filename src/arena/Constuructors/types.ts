/* eslint-disable no-use-before-define */
import type { Item } from '../../models/item';
import type { ProtectNext } from '../actions/protect';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';
import type { AoeDmgMagicNext } from './AoeDmgMagicConstructor';
import type { DmgMagicNext } from './DmgMagicConstructor';
import type { HealMagicNext, HealNext } from './HealMagicConstructor';
import type { LongDmgMagicNext } from './LongDmgMagicConstructor';
import type { LongMagicNext } from './LongMagicConstructor';
import type { MagicNext } from './MagicConstructor';
import type { SkillNext } from './SkillConstructor';

export type CostType = 'en' | 'mp';
export type OrderType = 'all' | 'any' | 'enemy' | 'self';
export type AOEType = 'target' | 'team';
export type DamageType = 'acid' | 'fire' | 'lighting' | 'frost' | 'physical' | 'clear';
export type BreaksMessage =
  'NO_INITIATOR' |
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
  name: string;
  id: string;
  exp?: number;
  val?: number;
  hp?: number;
}[];

export type CustomMessageFn = (args: SuccessArgs) => string;

export interface CustomMessage {
  customMessage?(args: SuccessArgs): string;
}

export interface LongCustomMessage extends CustomMessage {
  longCustomMessage?(args: SuccessArgs): string;
}

export interface AoeMagic {
  runAoe?(initiator: Player, target: Player, game: GameService, index: number): void;
  getTargets?(): Player[];
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
  weapon: Item | undefined;
  dmgType: DamageType,
}

export type PhysBreak = Omit<BaseNext, 'exp'> & {
  actionType: 'phys';
  cause?: SuccessArgs;
  message: BreaksMessage;
  weapon: Item | undefined;
  expArr: ExpArr;
}

export type SuccessArgs =
  MagicNext |
  DmgMagicNext |
  LongDmgMagicNext |
  AoeDmgMagicNext |
  LongMagicNext |
  SkillNext |
  PhysNext |
  HealMagicNext |
  HealNext |
  ProtectNext;

export type ActionType = SuccessArgs['actionType'];

export interface Breaks {
  actionType: ActionType;
  message: BreaksMessage;
  cause?: SuccessArgs;
  action: string;
  initiator: string;
  target: string;
}

export type FailArgs = Breaks | PhysBreak;
