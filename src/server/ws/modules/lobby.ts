import { WebSocketRoute } from '../route';

export const lobby = new WebSocketRoute('lobby')
  .on('enter', (c) => {
    const character = c.get('character');

    c.subscribe('lobby');
    c.subscribe('match_making');
    c.publish('lobby', { type: 'lobby', action: 'enter', data: character.toPublicObject() });
  })
  .on('leave', (c) => {
    const character = c.get('character');

    c.unsubscribe('lobby');
    c.unsubscribe('match_making');

    c.publish('lobby', { type: 'lobby', action: 'leave', data: character.toPublicObject() });
  })
  .close((c) => {
    const character = c.get('character');

    c.unsubscribe('lobby');
    c.unsubscribe('match_making');

    c.publish('lobby', { type: 'lobby', action: 'leave', data: character.toPublicObject() });
  });
