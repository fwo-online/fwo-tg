import type { ForestEventAction } from '@fwo/shared';
import ValidationError from '@/arena/errors/ValidationError';
import { ForestService } from '@/arena/ForestService/ForestService';
import { broadcast } from '@/helpers/channelHelper';
import { createForest } from '@/helpers/forestHelper';
import { activeConnections } from '@/server/utils/activeConnectons';
import { withValidationRPC } from '@/server/utils/withValidation';
import type { Server, Socket } from '@/server/ws';

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

    forest.on('end', (_, reason, result) => {
      io.to(getRoom(forest)).emit('forest:end', reason, result);
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
        ).catch((e) => console.debug('Failed to send forest event notification:', e));
      }
    });

    forest.on('eventResolved', (_, result) => {
      io.to(getRoom(forest)).emit('forest:eventResolved', result);
    });

    forest.on('battleStart', (game) => {
      io.to(getRoom(forest)).emit('forest:battleStart', game.info.id);
    });

    forest.on('battleEnd', (_game, victory) => {
      io.to(getRoom(forest)).emit('forest:battleEnd', { victory });
    });
  });
};

export const onConnection = (_io: Server, socket: Socket) => {
  const { character } = socket.data;

  // Вход в лес
  socket.on('forest:enter', async (callback) => {
    withValidationRPC(async () => {
      // Проверяем, не в лесу ли уже игрок
      if (character.forestID) {
        throw new ValidationError('Вы уже в лесу');
      }

      // Проверяем, не в игре ли игрок
      if (character.gameId) {
        throw new ValidationError('Вы в бою');
      }

      // Создаём новый лес
      const forest = await createForest(character.id);

      return callback({ forestId: forest.id });
    }, callback);
  });

  // Подключение к лесу
  socket.on('forest:connect', async (callback) => {
    withValidationRPC(async () => {
      const forest = await ForestService.getForestByCharacterId(character.id);

      if (!forest) {
        throw new ValidationError('Вы не в лесу');
      }

      await socket.join(getRoom(forest));

      // Возвращаем текущий статус леса
      return callback(forest.getStatus());
    }, callback);
  });

  // Обработка действия на событие
  socket.on('forest:handleEvent', async (action: ForestEventAction, callback) => {
    withValidationRPC(async () => {
      const forest = await ForestService.getForestByCharacterId(character.id);

      if (!forest) {
        throw new ValidationError('Вы не в лесу');
      }

      const result = await forest.handleEventAction(action);
      return callback({ result });
    }, callback);
  });

  // Выход из леса
  socket.on('forest:exit', async (callback) => {
    withValidationRPC(async () => {
      const forest = await ForestService.getForestByCharacterId(character.id);

      if (!forest) {
        throw new ValidationError('Вы не в лесу');
      }

      await forest.exitForest();
      return callback({ success: true });
    }, callback);
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
