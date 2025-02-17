import { useCharacter } from '@/hooks/useCharacter';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { ServerToClientMessage } from '@fwo/schemas';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { useGameKickState } from './useGameKickState';

export function useGameLogState() {
  const socket = useWebSocket();
  const { gameID } = useParams();
  const { character } = useCharacter();
  const pushLog = useGameStore((state) => state.pushLog);

  useGameKickState();

  const handleStartRound = useCallback(
    ({ round }: Parameters<ServerToClientMessage['game:startRound']>[0]) => {
      pushLog(`⚡️ Раунд ${round} начинается ⚡`);
    },
    [pushLog],
  );

  const handleStartOrders = useCallback(() => {
    pushLog('Пришло время делать заказы!');
  }, [pushLog]);

  const handleEndOrders = useCallback(() => {
    pushLog('Время заказов вышло!');
  }, [pushLog]);

  const handleEndRound = useCallback(
    ({ dead, log }: Parameters<ServerToClientMessage['game:endRound']>[0]) => {
      pushLog(log);
    },
    [pushLog],
  );

  useEffect(() => {
    socket.on('game:startRound', handleStartRound);
    socket.on('game:startOrders', handleStartOrders);
    socket.on('game:endOrders', handleEndOrders);
    socket.on('game:endRound', handleEndRound);

    return () => {
      socket.off('game:startRound', handleStartRound);
      socket.off('game:startOrders', handleStartOrders);
      socket.off('game:endOrders', handleEndOrders);
      socket.off('game:endRound', handleEndRound);
    };
  }, [socket.on, socket.off, handleStartRound, handleStartOrders, handleEndOrders, handleEndRound]);
}
