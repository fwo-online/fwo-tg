import { Slider } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { type FC, useState } from 'react';
import { reservedClanName, type Action } from '@fwo/shared';
import { useGameActionTargets } from '../hooks/useGameActionTargets';
import { GameActionTarget } from './GameActionTarget';
import { useGameActionOrder } from '../hooks/useGameActionOrder';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';

export const GameAction: FC<{
  action: Action;
  onReset: () => void;
}> = ({ action, onReset }) => {
  const remainPower = useGameStore((state) => state.power);
  const [power, setPower] = useState(0);
  const { hasTargets, availableTargets } = useGameActionTargets({ action });
  const [target, setTarget] = useState<string | null>(null);
  const { isPending, handleOrder } = useGameActionOrder(action, onReset);

  const handleSliderChange = (value: number) => {
    setPower(Math.min(remainPower, value));
  };

  const handleTargetChange = (target: string) => {
    setTarget(target);
  };

  const handleClick = () => {
    if (!target) {
      return;
    }
    handleOrder(target, power);
  };

  return (
    <Card header={<>Выбери цель для {action.displayName}</>}>
      {hasTargets ? (
        <Placeholder description="Нет доступных целей" />
      ) : (
        Object.entries(availableTargets).map(([clan, statuses]) => (
          <div key={clan} className="flex flex-col">
            <h6 className="font-semibold">{clan === reservedClanName ? 'Без клана' : clan}</h6>
            {statuses.map((status) => (
              <GameActionTarget key={status.id} status={status} onChange={handleTargetChange} />
            ))}
          </div>
        ))
      )}
      <div className="flex flex-col ga-2">
        <Slider
          before={0}
          after={remainPower}
          value={power}
          min={0}
          max={remainPower}
          onChange={handleSliderChange}
        />

        {!target ? (
          <Button disabled>Выбери цель</Button>
        ) : !power ? (
          <Button disabled>Выбери силу</Button>
        ) : (
          <Button className="is-primary" type="submit" disabled={isPending} onClick={handleClick}>
            Заказать {action.displayName} на {power}%
          </Button>
        )}
      </div>
    </Card>
  );
};
