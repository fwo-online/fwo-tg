export type GameStatus = {
  name: string;
  hp: number;
  mp: number;
  en: number;
};
export type PublicGameStatus = Pick<GameStatus, 'name' | 'hp'>;
