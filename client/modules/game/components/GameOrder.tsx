import { useState } from 'react';
import { GameActionList } from '@/modules/game//components/GameActionList';
import { GameAction } from '@/modules/game//components/GameAction';
import type { Action } from '@fwo/shared';

export const GameOrder = () => {
  const [selectedAction, setSelectedAction] = useState<Action>();

  const handleResetAction = () => {
    setSelectedAction(undefined);
  };

  return selectedAction ? (
    <GameAction action={selectedAction} onReset={handleResetAction} />
  ) : (
    <GameActionList onSelect={setSelectedAction} />
  );
};
