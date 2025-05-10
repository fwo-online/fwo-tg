import { useGameStore } from '../store/useGameStore';
import { useTransition } from 'react';
import { pick } from 'es-toolkit';
import { useSocket } from '@/stores/socket';
import { usePopup } from '@/hooks/usePopup';
import type { OrderResponse } from '@fwo/shared';

export const useGameActionOrder = (onSuccess: () => void) => {
  const socket = useSocket();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setActions = useGameStore((state) => state.setActions);
  const [isPending, startTransition] = useTransition();
  const popup = usePopup();

  const handleOrderResponse = (res: OrderResponse) => {
    if (res.error) {
      popup.info({ message: res.message });
    } else {
      setOrders(res.orders);
      setRemainPower(res.power);
      setActions(pick(res, ['actions', 'magics', 'skills']));
      onSuccess();
    }
  };

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
      handleOrderResponse(res);
    });
  };

  const handleRepeat = async () => {
    startTransition(async () => {
      const res = await socket.emitWithAck('game:orderRepeat');
      handleOrderResponse(res);
    });
  };

  const handleReset = async () => {
    startTransition(async () => {
      const res = await socket.emitWithAck('game:orderReset');
      handleOrderResponse(res);
    });
  };

  const handleRemove = async (orderID: string) => {
    startTransition(async () => {
      const res = await socket.emitWithAck('game:orderRemove', orderID);
      handleOrderResponse(res);
    });
  };

  return {
    isPending,
    handleOrder,
    handleRepeat,
    handleReset,
    handleRemove,
  };
};
