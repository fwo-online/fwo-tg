import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Загрузка нативного Rust бинарника
const binding = require(join(__dirname, 'fwo-engine.linux-x64-gnu.node'));

export interface WeaponDef {
  weaponType: string;
  minHit: number;
  maxHit: number;
}

export interface PlayerDef {
  id: number;
  nick: string;
  clanId?: string;
  weapon: WeaponDef;
  skills: Record<string, number>;
  magics: Record<string, number>;
  passives: Record<string, number>;
  resists: Record<string, number>;
  baseStats: Record<string, number>;
  maxTarget: number;
}

export interface BattleDefs {
  players: PlayerDef[];
}

export type AffectType = 'Round' | 'Long' | 'Passive';

export interface Affect {
  actionKey: string;
  initiatorId: number;
  affectType: AffectType;
  duration: number;
  value: number;
  proc: number;
}

export interface DynamicState {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  energy: number;
  maxEnergy: number;
  expEarned: number;
  isAlive: boolean;
  killerId?: number;
  failStreaks: Record<string, number>;
  affects: Affect[];
}

export interface BattleState {
  players: DynamicState[];
  round: number;
  noDamageStreak: number;
}

export type OrderTargetType = 'SelfTarget' | 'Enemy' | 'Team' | 'TeamExceptSelf' | 'All';

export interface Order {
  initiator: number;
  target: number;
  action: string;
  proc: number;
}

export interface BattleEvent {
  eventType: string;
  initiatorId: number;
  targetId: number;
  actionKey: string;
  value: number;
  reason?: string;
  targetHpLeft?: number;
  exp?: number;
}

export interface RoundInput {
  defs: BattleDefs;
  state: BattleState;
  orders: Order[];
}

export interface RoundOutput {
  nextState: BattleState;
  events: BattleEvent[];
  isGameEnd: boolean;
  endReason?: string;
}

export interface EngineStatus {
  ready: boolean;
  version: string;
  engineName: string;
}

export const ping = (msg: string): string => binding.ping(msg);
export const floatNumber = (val: number): number => binding.floatNumber(val);
export const rollDiceExpr = (diceStr: string): number => binding.rollDiceExpr(diceStr);
export const rollRndmExpr = (diceStr: string): number => binding.rollRndmExpr(diceStr);
export const checkPseudoChance = (chancePercent: number, failStreak: number): boolean =>
  binding.checkPseudoChance(chancePercent, failStreak);
export const getEngineStatus = (): EngineStatus => binding.getEngineStatus();
export const executeRound = (input: RoundInput): RoundOutput => binding.executeRound(input);
export const executeSingleAction = (input: RoundInput): RoundOutput =>
  binding.executeSingleAction(input);

export default {
  ping,
  floatNumber,
  rollDiceExpr,
  rollRndmExpr,
  checkPseudoChance,
  getEngineStatus,
  executeRound,
  executeSingleAction,
};
