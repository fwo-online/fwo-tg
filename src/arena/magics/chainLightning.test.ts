import { times } from 'lodash';
import CharacterService from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import TestUtils from '@/utils/testUtils';
import chainLightning from './chainLightning';
// import Player from '@/arena/Player';

// npm t src/arena/magics/chainLightning.test.ts

jest.retryTimes(3);

describe('PlayerService', () => {
  let game: GameService;

  beforeEach(async () => {
    const initiator = await TestUtils.createCharacter({ prof: 'm', magics: { chainLightning: 3 } });
    const chars = await Promise.all(times(10, () => TestUtils.createCharacter()));
    const charIds = chars.map(({ id }) => id);

    await TestUtils.createClan(charIds[1], {
      players: charIds,
    });

    await Promise.all(charIds.map(CharacterService.getCharacterById));

    game = new GameService([initiator.id, ...charIds]);
  });

  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('should hit 5 targets', () => {
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(game.battleLog.format()).toMatchSnapshot();
  });

  it('should hit 4 targets', () => {
    game.players.players[0].magics = { chainLightning: 2 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(game.battleLog.format()).toMatchSnapshot();
  });

  it('should hit 3 targets', () => {
    game.players.players[0].magics = { chainLightning: 1 };
    game.players.players[0].proc = 1;

    chainLightning.cast(game.players.players[0], game.players.players[1], game);

    expect(
      game.players.players.map((player) => player.stats.val('hp')),
    ).toMatchSnapshot();
    expect(game.players.players[0].stats.val('exp')).toMatchSnapshot();
    expect(game.battleLog.format()).toMatchSnapshot();
  });
});
