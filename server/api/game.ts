import { GameModel } from '@/models/game';

export async function createGame(players: string[]) {
  const createdGame = await GameModel.create({
    players,
  });
  await createdGame.save();

  const game = await GameModel
    .findById(createdGame.id)
    .orFail(new Error('Игра не найдена'));

  return game.toObject();
}
