import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useCharacter } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import type { CharacterPublic, GameType } from '@fwo/shared';
import { useCallback, useState } from 'react';

/**
 * Hook для глобального отслеживания состояния поиска боя.
 * Определяет, ищет ли текущий персонаж бой в любой из очередей (practice/ladder/tower)
 */
export const useGlobalQueueStatus = () => {
  const socket = useSocket();
  const characterID = useCharacter((character) => character.id);

  const [queueType, setQueueType] = useState<GameType | null>(null);

  const handleLobbyList = useCallback(
    (characters: Record<GameType, CharacterPublic[]>) => {
      // Проверяем, в какой очереди находится текущий персонаж
      const queues: GameType[] = ['practice', 'ladder', 'tower'];

      for (const queue of queues) {
        const isInQueue = characters[queue]?.some(({ id }) => id === characterID);
        if (isInQueue) {
          setQueueType(queue);
          return;
        }
      }

      // Если персонажа нет ни в одной очереди
      setQueueType(null);
    },
    [characterID],
  );

  useSocketListener('lobby:list', handleLobbyList);

  useMountEffect(() => {
    socket.emitWithAck('lobby:enter').then(handleLobbyList);
  });

  return {
    isSearching: queueType !== null,
    queueType,
  };
};
