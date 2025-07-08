import { pick } from 'es-toolkit';
import { useSocket } from '@/stores/socket';
import { usePopup } from '@/hooks/usePopup';
import type { OrderResponse } from '@fwo/shared';
import { useRequest } from '@/hooks/useRequest';
import { useGameStore } from '@/modules/game/store/useGameStore';

export const useGameActionOrder = (onSuccess: () => void) => {
  const socket = useSocket();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);
  const setActions = useGameStore((state) => state.setActions);
  const [isPending, makeRequest] = useRequest();
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

    makeRequest(async () => {
      const res = await socket.emitWithAck('game:order', {
        power,
        target,
        action,
      });
      handleOrderResponse(res);
    });
  };

  const handleRepeat = async () => {
    makeRequest(async () => {
      const res = await socket.emitWithAck('game:order:repeat');
      handleOrderResponse(res);
    });
  };

  const handleReset = async () => {
    makeRequest(async () => {
      const res = await socket.emitWithAck('game:order:reset');
      handleOrderResponse(res);
    });
  };

  const handleRemove = async (orderID: string) => {
    makeRequest(async () => {
      const res = await socket.emitWithAck('game:order:remove', orderID);
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
