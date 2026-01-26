import type { ForestEventAction } from '@fwo/shared';
import { ForestService } from '@/arena/ForestService/ForestService';
import { activeConnections } from '@/server/utils/activeConnectons';
import type { Server, Socket } from '@/server/ws';
import { broadcast } from '@/helpers/channelHelper';

const getRoom = (forest: ForestService) => {
  return `forest:${forest.id}`;
};

export const onCreate = (io: Server) => {
  ForestService.emitter.on('start', async (forest) => {
    const character = forest.player;
    const socket = activeConnections.get(character.owner);

    if (socket) {
      await socket.join(getRoom(forest));
    } else {
      console.log('no connection found for forest player: ', character.id);
    }

    io.to(getRoom(forest)).emit('forest:start', forest.id);

    forest.on('end', (_, reason) => {
      io.to(getRoom(forest)).emit('forest:end', reason);
    });

    forest.on('updateStatus', (status) => {
      io.to(getRoom(forest)).emit('forest:updateStatus', status);
    });

    forest.on('event', (_, eventType) => {
      io.to(getRoom(forest)).emit('forest:event', eventType);

      // Отправляем Telegram уведомление если игрок не активен
      const socket = activeConnections.get(character.owner);
      if (!socket || !socket.connected) {
        broadcast(
          `🌲 У вас произошло событие в лесу! У вас есть 30 секунд чтобы среагировать.`,
          character.owner,
        ).catch((e) => console.error('Failed to send forest event notification:', e));
      }
    });

    forest.on('eventResolved', (_, result) => {
      io.to(getRoom(forest)).emit('forest:eventResolved', result);
    });

    forest.on('eventTimeout', () => {
      io.to(getRoom(forest)).emit('forest:eventTimeout');
    });

    forest.on('battleStart', (game) => {
      io.to(getRoom(forest)).emit('forest:battleStart', game.info.id);
    });

    forest.on('battleEnd', (game, victory) => {
      io.to(getRoom(forest)).emit('forest:battleEnd', { victory });
    });
  });
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  // Подключение к лесу
  socket.on('forest:connect', async (callback) => {
    try {
      const forest = await ForestService.getForestByCharacterId(character.id);

      if (!forest) {
        return callback({ error: true, message: 'Вы не в лесу' });
      }

      await socket.join(getRoom(forest));

      // Возвращаем текущий статус леса
      return callback({
        id: forest.id,
        state: forest.forest.state,
        playerHP: forest.forest.playerHP,
        playerMaxHP: forest.forest.playerMaxHP,
        timeInForest: forest.forest.timeInForest,
        eventsEncountered: forest.forest.eventsEncountered,
        currentEvent: forest.forest.currentEvent
          ? {
              type: forest.forest.currentEvent.type,
              expiresAt: forest.forest.currentEvent.expiresAt,
              availableActions: forest['getAvailableActions'](forest.forest.currentEvent.type),
            }
          : undefined,
      });
    } catch (e) {
      console.error('forest:connect error:', e);
      return callback({ error: true, message: 'Что-то пошло не так' });
    }
  });

  // Обработка действия на событие
  socket.on('forest:handleEvent', async (action: ForestEventAction, callback) => {
    try {
      const forest = await ForestService.getForestByCharacterId(character.id);

      if (!forest) {
        return callback({ error: true, message: 'Вы не в лесу' });
      }

      const result = await forest.handleEventAction(action);
      return callback({ result });
    } catch (e) {
      console.error('forest:handleEvent error:', e);
      return callback({ error: true, message: e instanceof Error ? e.message : 'Что-то пошло не так' });
    }
  });

  // Выход из леса
  socket.on('forest:exit', async (callback) => {
    try {
      const forest = await ForestService.getForestByCharacterId(character.id);

      if (!forest) {
        return callback({ error: true, message: 'Вы не в лесу' });
      }

      await forest.exitForest();
      return callback({ success: true });
    } catch (e) {
      console.error('forest:exit error:', e);
      return callback({ error: true, message: 'Что-то пошло не так' });
    }
  });

  // Автоматическое подключение к лесу если игрок там находится
  if (character.forestID) {
    ForestService.getForestByCharacterId(character.id).then((forest) => {
      if (forest) {
        socket.join(getRoom(forest));
      }
    });
  }
};
