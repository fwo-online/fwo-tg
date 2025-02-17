import { useActionState, useEffect, useState } from 'react';
import { GameActionList } from '@/modules/game//components/GameActionList';
import { GameAction } from '@/modules/game//components/GameAction';
import type { Action, ServerToClientMessage } from '@fwo/schemas';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '../store/useGameStore';
import { popup } from '@telegram-apps/sdk-react';

export const GameOrder = () => {
  const socket = useWebSocket();
  const [selectedAction, setSelectedAction] = useState<Action>();
  const setOrders = useGameStore((state) => state.setOrders);
  const setRemainPower = useGameStore((state) => state.setPower);

  const [state, formAction] = useActionState<null, FormData>(async (_payload, formData) => {
    const target = formData.get('target');
    const power = formData.get('power');

    if (!target || !power) {
      return null;
    }

    const res = await socket.emitWithAck('game:order', {
      power,
      target,
      action: selectedAction?.name,
    });

    if (res.error) {
      popup.open({ message: res.message });
    } else {
      setSelectedAction(undefined);
      setOrders(res.orders);
      setRemainPower(res.power);
    }

    return null;
  }, null);

  return (
    <form action={formAction}>
      {selectedAction ? (
        <GameAction action={selectedAction} />
      ) : (
        <GameActionList onSelect={setSelectedAction} />
      )}
    </form>
  );
};
