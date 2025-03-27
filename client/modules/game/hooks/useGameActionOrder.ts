import { useWebSocket } from '@/contexts/webSocket';
import { useGameStore } from '../store/useGameStore';
import { useTransition } from 'react';
import { pick } from 'es-toolkit';
import { useModal } from '@/contexts/modal';

export const useGameActionOrder = (onSuccess: () => void) => {
  const socket = useWebSocket();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setActions = useGameStore((state) => state.setActions);
  const [isPending, startTransition] = useTransition();
  const modal = useModal();

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
        modal.show({ message: res.message });
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
        modal.show({ message: res.message });
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
        modal.info({ message: res.message });
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
