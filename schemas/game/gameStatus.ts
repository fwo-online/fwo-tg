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
