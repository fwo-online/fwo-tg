import type { ServerToClientMessage } from '@fwo/shared';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMountEffect } from '@/hooks/useMountEffect';
import { usePopup } from '@/hooks/usePopup';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useGameResult } from '@/modules/game/hooks/useGameResult';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { useSocket } from '@/stores/socket';
import { useGameKickState } from './useGameKickState';

export function useGameState() {
  const socket = useSocket();
  const { syncCharacter } = useSyncCharacter();
  const popup = usePopup();
  const { handleGameResult } = useGameResult();

  const navigate = useNavigate();
  const setOrders = useGameStore((state) => state.setOrders);
  const setActionPoints = useGameStore((state) => state.setActionPoints);
  const setOrdersTime = useGameStore((state) => state.setOrdersTime);
  const setActions = useGameStore((state) => state.setActions);
  const setCanOrder = useGameStore((state) => state.setCanOrder);
  const setStatusByClan = useGameStore((state) => state.setStatusByClan);
  const setRound = useGameStore((state) => state.setRound);
  const setPlayers = useGameStore((state) => state.setPlayers);
  const setClans = useGameStore((state) => state.setClans);
  const setReady = useGameStore((state) => state.setReady);

  useGameKickState();

  const handleStartRound = useCallback(
    ({ round, status }: Parameters<ServerToClientMessage['game:startRound']>[0]) => {
      setRound(round);
      setStatusByClan(status);
    },
    [setRound, setStatusByClan],
  );

  const handlePlayers = useCallback(
    ({ players, clans }: Parameters<ServerToClientMessage['game:players']>[0]) => {
      setPlayers(players);
      setClans(clans);
    },
    [setPlayers, setClans],
  );

  const handleStartOrders = useCallback(
    ({
      actions,
      magics,
      skills,
      orders,
      status,
      ordersTime,
      ordersStartTime,
      ready,
    }: Parameters<ServerToClientMessage['game:startOrders']>[0]) => {
      setActions({ actions, magics, skills });
      setCanOrder(true);
      setOrders(orders);
      setActionPoints(status.ap, status.maxAP);
      setOrdersTime(ordersTime, ordersStartTime);
      setReady(ready);
    },
    [setActionPoints, setActions, setCanOrder, setOrders, setOrdersTime, setReady],
  );

  const handleEndOrders = useCallback(() => {
    setCanOrder(false);
    setOrders([]);
  }, [setOrders, setCanOrder]);

  const handleEndGame = (results: Parameters<ServerToClientMessage['game:end']>[0]) => {
    navigate('/');
    handleGameResult(results);
  };

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

  useSocketListener('game:players', handlePlayers);
  useSocketListener('game:startRound', handleStartRound);
  useSocketListener('game:startOrders', handleStartOrders);
  useSocketListener('game:endOrders', handleEndOrders);
  useSocketListener('game:end', handleEndGame);
}
