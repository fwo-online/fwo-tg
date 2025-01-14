import MatchMakingService from '@/arena/MatchMakingService';
import { WebSocketRoute } from '../route';

export const matchMaking = new WebSocketRoute('match_making')
  .on('start_search', (c, message) => {
    const character = c.get('character');

    MatchMakingService.push({ id: character.id, psr: 1000, startTime: Date.now() });
    c.publish('match_making', { ...message, data: character.toPublicObject() });
  })
  .on('stop_search', (c, message) => {
    const character = c.get('character');

    MatchMakingService.pull(character.id);
    c.publish('match_making', { ...message, data: character.toPublicObject() });
  });
