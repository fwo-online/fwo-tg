import { useWebSocket } from '@/hooks/useWebSocket';
import type { ServerToClientMessage } from '@fwo/schemas';
import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { useGameKickState } from './useGameKickState';

export function useGameState() {
  const socket = useWebSocket();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setActions = useGameStore((state) => state.setActions);
  const setCanOrder = useGameStore((state) => state.setCanOrder);
  const setStatus = useGameStore((state) => state.setStatus);
  const setStatusByClan = useGameStore((state) => state.setStatusByClan);
  const setRound = useGameStore((state) => state.setRound);

  useGameKickState();

  const handleStartRound = useCallback(
    ({ round, status, statusByClan }: Parameters<ServerToClientMessage['game:startRound']>[0]) => {
      setRound(round);
      setStatus(status);
      setStatusByClan(statusByClan);
    },
    [setRound, setStatus, setStatusByClan],
  );

  const handleStartOrders = useCallback(
    ({ actions, magics, skills }: Parameters<ServerToClientMessage['game:startOrders']>[0]) => {
      setActions({ actions, magics, skills });
      setCanOrder(true);
      setRemainPower(100);
    },
    [setActions, setCanOrder, setRemainPower],
  );

  const handleEndOrders = useCallback(() => {
    setCanOrder(false);
    setOrders([]);
  }, [setOrders, setCanOrder]);

  useEffect(() => {
    socket.on('game:startRound', handleStartRound);
    socket.on('game:startOrders', handleStartOrders);
    socket.on('game:endOrders', handleEndOrders);

    return () => {
      socket.off('game:startRound', handleStartRound);
      socket.off('game:startOrders', handleStartOrders);
      socket.off('game:endOrders', handleEndOrders);
    };
  }, [socket.on, socket.off, handleStartRound, handleStartOrders, handleEndOrders]);
}
