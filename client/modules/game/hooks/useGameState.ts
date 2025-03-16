import { useWebSocket } from '@/contexts/webSocket';
import type { ServerToClientMessage } from '@fwo/schemas';
import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { useGameKickState } from './useGameKickState';
import { useMount } from '@/hooks/useMount';
import { useNavigate } from 'react-router';

export function useGameState() {
  const socket = useWebSocket();

  const navigate = useNavigate();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setActions = useGameStore((state) => state.setActions);
  const setCanOrder = useGameStore((state) => state.setCanOrder);
  const setStatusByClan = useGameStore((state) => state.setStatusByClan);
  const setRound = useGameStore((state) => state.setRound);
  const setPlayers = useGameStore((state) => state.setPlayers);

  useGameKickState();

  const handleStartRound = useCallback(
    ({ round, status }: Parameters<ServerToClientMessage['game:startRound']>[0]) => {
      setRound(round);
      setStatusByClan(status);
    },
    [setRound, setStatusByClan],
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

  const handleEndGame = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const connect = () => {
    socket.emitWithAck('game:connected').then((res) => {
      if (!res.error) {
        setPlayers(res.players);
      }
    });
  };

  useMount(connect);

  useEffect(() => {
    socket.on('game:startRound', handleStartRound);
    socket.on('game:startOrders', handleStartOrders);
    socket.on('game:endOrders', handleEndOrders);
    socket.on('game:end', handleEndGame);

    return () => {
      socket.off('game:startRound', handleStartRound);
      socket.off('game:startOrders', handleStartOrders);
      socket.off('game:endOrders', handleEndOrders);
      socket.off('game:end', handleEndGame);
    };
  }, [socket.on, socket.off, handleStartRound, handleStartOrders, handleEndOrders, handleEndGame]);
}
