import type { ServerToClientMessage } from '@fwo/shared';
import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { useGameKickState } from './useGameKickState';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useNavigate } from 'react-router';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useSocket } from '@/stores/socket';
import { usePopup } from '@/hooks/usePopup';

export function useGameState() {
  const socket = useSocket();
  const { syncCharacter } = useSyncCharacter();
  const popup = usePopup();

  const navigate = useNavigate();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setOrdersTime = useGameStore((state) => state.setOrdersTime);
  const setActions = useGameStore((state) => state.setActions);
  const setCanOrder = useGameStore((state) => state.setCanOrder);
  const setStatusByClan = useGameStore((state) => state.setStatusByClan);
  const setRound = useGameStore((state) => state.setRound);
  const setPlayers = useGameStore((state) => state.setPlayers);
  const setClans = useGameStore((state) => state.setClans);

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
      ordersTime,
      ordersStartTime,
    }: Parameters<ServerToClientMessage['game:startOrders']>[0]) => {
      setActions({ actions, magics, skills });
      setCanOrder(true);
      setOrders(orders);
      setRemainPower(power);
      setOrdersTime(ordersTime, ordersStartTime);
    },
    [setActions, setCanOrder, setRemainPower, setOrders, setOrdersTime],
  );

  const handleEndOrders = useCallback(() => {
    setCanOrder(false);
    setOrders([]);
  }, [setOrders, setCanOrder]);

  const handleEndGame = useCallback(() => {
    navigate('/');
    popup.info({ message: 'Игра завершена' });
  }, [navigate, popup.info]);

  const handleStartGame = () => {
    socket.emitWithAck('game:connected').then(async (res) => {
      if (!res.error) {
        setPlayers(res.players);
        setClans(res.clans);
      } else {
        await syncCharacter();
        navigate('/');
        popup.info({ title: 'Не удалось подключиться к игре', message: res.message });
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
  }, [socket, handleStartRound, handleStartOrders, handleEndOrders, handleEndGame]);
}
