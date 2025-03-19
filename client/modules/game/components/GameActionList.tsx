import { useGameStore } from '@/modules/game/store/useGameStore';
import type { FC } from 'react';
import type { Action } from '@fwo/shared';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const GameActionList: FC<{
  isPending: boolean;
  onSelect: (action: Action) => void;
  onRepeat: () => void;
  onReset: () => void;
}> = ({ isPending, onSelect, onRepeat, onReset }) => {
  const round = useGameStore((state) => state.round);
  const actions = useGameStore((state) => state.actions);
  const magics = useGameStore((state) => state.magics);
  const skills = useGameStore((state) => state.skills);
  const power = useGameStore((state) => state.power);

  const isActionDisabled = (action: Action) => {
    if (action.power) {
      return action.power > power;
    }

    return false;
  };

  return (
    <Card header="Действия">
      <div className="flex flex-col gap-1">
        {power === 100 && round > 1 && (
          <Button className="p-0  mb-4" onClick={onRepeat} disabled={isPending}>
            Повторить
          </Button>
        )}
        {power !== 100 && (
          <Button className="p-0 mb-4" onClick={onReset} disabled={isPending}>
            Очистить
          </Button>
        )}
        {actions.map((action) => (
          <Button className="p-0 is-primary" key={action.name} onClick={() => onSelect(action)}>
            {action.displayName}
          </Button>
        ))}
        {magics.length ? (
          <>
            <h6>Магии</h6>
            {magics.map((action) => (
              <Button key={action.name} className="p-0 is-primary" onClick={() => onSelect(action)}>
                <div className="flex w-full justify-between">
                  <span>{action.displayName}</span>
                  <span>{action.cost}💧</span>
                </div>
              </Button>
            ))}
          </>
        ) : null}

        {skills.length ? (
          <>
            <h6>Умения</h6>
            {skills.map((action) => (
              <Button
                key={action.name}
                className="p-0 is-primary"
                disabled={isActionDisabled(action)}
                onClick={() => onSelect(action)}
              >
                <div className="flex w-full justify-between">
                  <span>{action.displayName}</span>
                  <span>{action.cost}🔋</span>
                </div>
              </Button>
            ))}
          </>
        ) : null}
      </div>
    </Card>
  );
};
