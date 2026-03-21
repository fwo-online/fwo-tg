import { type Action, reservedClanName } from '@fwo/shared';
import { type FC, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useGameActionTargets } from '../hooks/useGameActionTargets';
import { GameActionTarget } from './GameActionTarget';

export const GameAction: FC<{
  action: Action;
  isPending: boolean;
  onOrder: (action: string, target: string) => void;
  onCancel: () => void;
}> = ({ action, onOrder, onCancel, isPending }) => {
  const { hasTargets, availableTargets } = useGameActionTargets({ action });
  const [target, setTarget] = useState<string | null>(null);

  const handleTargetChange = (target: string) => {
    setTarget(target);
  };

  const handleClick = () => {
    if (!target) {
      return;
    }
    onOrder(action.name, target);
  };

  return (
    <Card header={action.displayName}>
      {hasTargets ? (
        <Placeholder description="Нет доступных целей" />
      ) : (
        Object.entries(availableTargets).map(([clan, players]) => (
          <div key={clan} className="flex flex-col">
            <h6 className="font-semibold">{clan === reservedClanName ? 'Без клана' : clan}</h6>
            {players.map((player) => (
              <GameActionTarget key={player.id} player={player} onChange={handleTargetChange} />
            ))}
          </div>
        ))
      )}
      <div className="flex flex-col gap-2">
        {!target ? (
          <Button disabled>Выбери цель</Button>
        ) : (
          <Button className="is-primary" type="submit" disabled={isPending} onClick={handleClick}>
            {action.displayName} за {action.ap} AP
          </Button>
        )}
        <Button onClick={onCancel}>Отмена</Button>
      </div>
    </Card>
  );
};
