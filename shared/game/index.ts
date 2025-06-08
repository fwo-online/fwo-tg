import type { Item, ItemComponent } from '@/item';
import type { Player } from '@/shared';

export type GameResult = {
  player: Player;
  exp: number;
  winner: boolean;
  gold?: number;
  components?: Partial<Record<ItemComponent, number>>;
  item?: Item;
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
