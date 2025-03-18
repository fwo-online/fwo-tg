import { useState } from 'react';
import { GameActionList } from '@/modules/game//components/GameActionList';
import { GameAction } from '@/modules/game//components/GameAction';
import type { Action } from '@fwo/shared';
import { useGameActionOrder } from '../hooks/useGameActionOrder';

export const GameOrder = () => {
  const [selectedAction, setSelectedAction] = useState<Action>();

  const handleResetAction = () => {
    setSelectedAction(undefined);
  };

  const { isPending, handleOrder, handleRepeat, handleReset } =
    useGameActionOrder(
      handleResetAction,
    );

  return selectedAction ? (
    <GameAction isPending={isPending} action={selectedAction} onOrder={handleOrder} />
  ) : (
    <GameActionList
      isPending={isPending}
      onSelect={setSelectedAction}
      onRepeat={handleRepeat}
      onReset={handleReset}
    />
  );
};
