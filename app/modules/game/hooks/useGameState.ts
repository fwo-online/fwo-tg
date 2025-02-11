import { useCharacter } from '@/hooks/useCharacter';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Action, ServerToClientMessage } from '@fwo/schemas';
import { popup } from '@telegram-apps/sdk-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGameStore } from '@/modules/game/store/useGameStore';

export function useGameState() {
  const socket = useWebSocket();
  const { gameID } = useParams();
  const { character } = useCharacter();
  const navigate = useNavigate();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setActions = useGameStore((state) => state.setActions);
  const remainPower = useGameStore((state) => state.power);
  const setCanOrder = useGameStore((state) => state.setCanOrder);
  const setStatus = useGameStore((state) => state.setStatus);
  const setStatusByClan = useGameStore((state) => state.setStatusByClan);
  const setRound = useGameStore((state) => state.setRound);

  const [messages, setMessages] = useState<ReactNode[]>([]);
  const [power, setPower] = useState(0);
  const [selectedAction, setSelectedAction] = useState<Action>();

  const handleStartRound = useCallback(
    ({ round, status, statusByClan }: Parameters<ServerToClientMessage['game:startRound']>[0]) => {
      setRound(round);
      setStatus(status);
      setStatusByClan(statusByClan);
    },
    [setRound, setStatus, setStatusByClan],
  );

  const handlePreKick = useCallback(() => {
    popup.open({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  }, []);

  const handleKick = useCallback(async () => {
    navigate('/');
    await popup.open({ message: 'Вы были выброшены из игры' });
  }, [navigate]);

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
    socket.on('game:preKick', handlePreKick);
    socket.on('game:kick', handleKick);
    socket.on('game:startOrders', handleStartOrders);
    socket.on('game:endOrders', handleEndOrders);

    return () => {
      socket.off('game:startRound', handleStartRound);
      socket.off('game:preKick', handlePreKick);
      socket.off('game:kick', handleKick);
      socket.off('game:endOrders', handleEndOrders);
    };
  }, [
    socket.on,
    socket.off,
    handleStartRound,
    handlePreKick,
    handleKick,
    handleStartOrders,
    handleEndOrders,
  ]);

  const handleActionClick = async (target: string) => {
    if (selectedAction) {
      socket
        .emitWithAck('game:order', {
          power,
          target,
          action: selectedAction?.name,
        })
        .then((res) => {
          if (res.success) {
            setOrders(res.orders);
          } else {
            popup.open({ message: res.message });
          }
        });
    }
  };
}
