import { WebSocketRoute } from '@/server/ws/route';
import type { WebSocketEnv } from '@/server/ws/context';
import type GameService from '@/arena/GameService';
import type PlayerService from '@/arena/PlayersService/PlayerService';
import { WebSocketHelper } from '@/helpers/webSocketHelper';
import MatchMakingService from '@/arena/MatchMakingService';
import { noClanName } from '@/arena/ClanService';
import { gameMessageSchema } from '@fwo/schemas';

type GameEnv = WebSocketEnv & {
  Variables: {
    game: GameService;
    player: PlayerService;
    gameHandler: (game: GameService) => void;
  };
};

const buildScope = (game: GameService, scope?: string) => {
  return `${game.info.id}:${scope}`;
};

export const game = new WebSocketRoute<GameEnv, 'game'>('game')
  .open((c) => {
    const character = c.get('character');

    const handler = (game: GameService) => {
      const player = game.players.getById(character.id);
      if (player) {
        c.set('game', game);
        c.set('player', player);

        const scope = player.clan?.name ?? noClanName;

        c.subscribe(buildScope(game));
        c.subscribe(buildScope(game, scope));
      }
    };

    MatchMakingService.on('start', handler);
    c.set('gameHandler', handler);
  })
  .close((c) => {
    const game = c.get('game');
    const player = c.get('player');
    const gameHandler = c.get('gameHandler');
    MatchMakingService.off('start', gameHandler);

    if (!game) {
      return;
    }

    const scope = player.clan?.name ?? 'noClan';

    c.unsubscribe(buildScope(game));
    c.unsubscribe(buildScope(game, scope));
  });

MatchMakingService.on('start', (game) => {
  gameMessageSchema.options.forEach((option) => {
    const action = option.shape.action.value;

    game.on(action, (message, scope) => {
      WebSocketHelper.publish(buildScope(game, scope), {
        type: 'game',
        action,
        ...message,
      });
    });
  });
});
