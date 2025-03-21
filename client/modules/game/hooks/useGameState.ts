import { useWebSocket } from '@/contexts/webSocket';
import type { ServerToClientMessage } from '@fwo/shared';
import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { useGameKickState } from './useGameKickState';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useNavigate } from 'react-router';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { popup } from '@telegram-apps/sdk-react';

export function useGameState() {
  const socket = useWebSocket();
  const { updateCharacter } = useUpdateCharacter();

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
    ({
      actions,
      magics,
      skills,
      orders,
      power,
    }: Parameters<ServerToClientMessage['game:startOrders']>[0]) => {
      setActions({ actions, magics, skills });
      setCanOrder(true);
      setOrders(orders);
      setRemainPower(power);
    },
    [setActions, setCanOrder, setRemainPower, setOrders],
  );

  const handleEndOrders = useCallback(() => {
    setCanOrder(false);
    setOrders([]);
  }, [setOrders, setCanOrder]);

  const handleEndGame = useCallback(async () => {
    await updateCharacter();
    navigate('/');
    popup.open({ message: 'Игра завершена' });
  }, [navigate, updateCharacter]);

  const handleStartGame = () => {
    socket.emitWithAck('game:connected').then((res) => {
      if (!res.error) {
        setPlayers(res.players);
      } else {
        navigate('/');
        popup.open({ title: 'Не удалось подключиться к игре', message: res.message });
      }
    });
  };

  useMountEffect(() => {
    if (socket.connected) {
      handleStartGame();
    } else {
      socket.once('connect', handleStartGame);
    }
  });

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
