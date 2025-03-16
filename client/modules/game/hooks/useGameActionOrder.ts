import { useWebSocket } from '@/contexts/webSocket';
import type { Action } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';
import { useGameStore } from '../store/useGameStore';
import { useTransition } from 'react';

export const useGameActionOrder = (action: Action, onSuccess: () => void) => {
  const socket = useWebSocket();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const [isPending, startTransition] = useTransition();

  const handleOrder = async (target: string, power: number) => {
    startTransition(async () => {
      const res = await socket.emitWithAck('game:order', {
        power,
        target,
        action: action.name,
      });

      if (res.error) {
        popup.open({ message: res.message });
      } else {
        setOrders(res.orders);
        setRemainPower(res.power);
        onSuccess();
      }
    });
  };

  return {
    isPending,
    handleOrder,
  };
};
