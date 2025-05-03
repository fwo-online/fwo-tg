import { Slider } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { type FC, useState } from 'react';
import { reservedClanName, type Action } from '@fwo/shared';
import { useGameActionTargets } from '../hooks/useGameActionTargets';
import { GameActionTarget } from './GameActionTarget';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { useMountEffect } from '@/hooks/useMountEffect';

export const GameAction: FC<{
  action: Action;
  isPending: boolean;
  onOrder: (action: string, target: string, power: number) => void;
}> = ({ action, onOrder, isPending }) => {
  const remainPower = useGameStore((state) => state.power);
  const [power, setPower] = useState(0);
  const { hasTargets, availableTargets } = useGameActionTargets({ action });
  const [target, setTarget] = useState<string | null>(null);

  const handleSliderChange = (value: number) => {
    if (action.power) {
      return;
    }
    setPower(Math.min(remainPower, value));
  };

  const handleTargetChange = (target: string) => {
    setTarget(target);
  };

  const handleClick = () => {
    if (!target) {
      return;
    }
    onOrder(action.name, target, power);
  };

  useMountEffect(() => {
    if (action.power) {
      setPower(action.power);
    } else {
      setPower(remainPower);
    }
  });

  return (
    <Card header={<>Выбери цель для {action.displayName}</>}>
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
