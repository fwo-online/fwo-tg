import type { Item, ItemComponent } from '@/item';
import type { Player } from '@/shared';

export type GameResult = {
  player: Player;
  exp: number;
  winner: boolean;
  gold?: number;
  components?: Partial<Record<ItemComponent, number>>;
  item?: Item;
  damage?: number;
  heal?: number;
  kills?: number;
  abilitiesUsed?: number;
  alive: boolean;
  levelUp?: {
    oldLevel: number;
    newLevel: number;
    freePoints: number;
  };
};

export type GameStatus = PublicGameStatus & {
  mp: number;
  en: number;
  maxMP: number;
  maxEN: number;
};

export type PublicGameStatus = {
  id: string;
  name: string;
  hp: number;
  mp: number;
  en: number;
  maxHP: number;
  maxMP: number;
  maxEN: number;
};

export type GameType = 'tower' | 'ladder' | 'practice';

export const towerRequiredLvl = 5;

export type CombatEventType =
  | 'damage'
  | 'heal'
  | 'buff'
  | 'debuff'
  | 'dodge'
  | 'block'
  | 'miss';

export type CombatEvent = {
  id: string;
  initiatorId: string;
  initiatorName: string;
  targetId: string;
  targetName: string;
  action: string;
  actionType: string;
  effect?: number;
  effectType?: string;
  type: CombatEventType;
  isCrit?: boolean;
  message?: string;
};

export type RoundResultPayload = {
  round: number;
  events: CombatEvent[];
  deadPlayerIds: string[];
};

