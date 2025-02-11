import { useActionState, useEffect, useState } from 'react';
import { GameActionList } from '@/modules/game//components/GameActionList';
import { GameAction } from '@/modules/game//components/GameAction';
import type { Action, ServerToClientMessage } from '@fwo/schemas';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '../store/useGameStore';

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

    await new Promise((r) => setTimeout(r, 1000));
    const res = await socket.emitWithAck('game:order', {
      power,
      target,
      action: selectedAction?.name,
    });

    if (res.success) {
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
