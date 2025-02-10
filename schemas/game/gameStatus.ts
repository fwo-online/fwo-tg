export type GameStatus = {
  id: string;
  name: string;
  hp: number;
  mp: number;
  en: number;
};
export type PublicGameStatus = Pick<GameStatus, 'id' | 'name' | 'hp'>;
