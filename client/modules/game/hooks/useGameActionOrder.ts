import { useWebSocket } from '@/contexts/webSocket';
import { popup } from '@telegram-apps/sdk-react';
import { useGameStore } from '../store/useGameStore';
import { useTransition } from 'react';
import { pick } from 'es-toolkit';

export const useGameActionOrder = (onSuccess: () => void) => {
  const socket = useWebSocket();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setActions = useGameStore((state) => state.setActions);
  const [isPending, startTransition] = useTransition();

  const handleOrder = async (action: string, target: string, power: number) => {
    if (!action) {
      return;
    }

    startTransition(async () => {
      const res = await socket.emitWithAck('game:order', {
        power,
        target,
        action,
      });

      if (res.error) {
        popup.open({ message: res.message });
      } else {
        setOrders(res.orders);
        setRemainPower(res.power);
        setActions(pick(res, ['actions', 'magics', 'skills']));
        onSuccess();
      }
    });
  };

  const handleRepeat = async () => {
    startTransition(async () => {
      const res = await socket.emitWithAck('game:orderRepeat');

      if (res.error) {
        popup.open({ message: res.message });
      } else {
        setOrders(res.orders);
        setRemainPower(res.power);
        setActions(pick(res, ['actions', 'magics', 'skills']));
        onSuccess();
      }
    });
  };

  const handleReset = async () => {
    startTransition(async () => {
      const res = await socket.emitWithAck('game:orderReset');

      if (res.error) {
        popup.open({ message: res.message });
      } else {
        setOrders(res.orders);
        setRemainPower(res.power);
        setActions(pick(res, ['actions', 'magics', 'skills']));
        onSuccess();
      }
    });
  };

  return {
    isPending,
    handleOrder,
    handleRepeat,
    handleReset,
  };
};
