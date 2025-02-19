import { Button, Placeholder, Section, Slider } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { type FC, useState } from 'react';
import type { Action } from '@fwo/schemas';
import { useGameActionTargets } from '../hooks/useGameActionTargets';
import { GameActionTarget } from './GameActionTarget';
import { useGameActionOrder } from '../hooks/useGameActionOrder';

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
    <Section>
      <Section.Header>Выбери цель для {action.displayName}</Section.Header>
      {hasTargets ? (
        <Placeholder description="Нет доступных целей" />
      ) : (
        Object.entries(availableTargets).map(([clan, statuses]) => (
          <Section key={clan}>
            <Section.Header>{clan}</Section.Header>
            {statuses.map((status) => (
              <GameActionTarget key={status.id} status={status} onChange={handleTargetChange} />
            ))}
          </Section>
        ))
      )}
      <Slider
        before={0}
        after={remainPower}
        value={power}
        min={0}
        max={remainPower}
        onChange={handleSliderChange}
      />

      {target ? (
        <Button
          stretched
          type="submit"
          disabled={isPending}
          loading={isPending}
          onClick={handleClick}
        >
          Заказать {action.displayName} на {power}%
        </Button>
      ) : (
        <Button stretched disabled>
          Выбери цель
        </Button>
      )}
    </Section>
  );
};
