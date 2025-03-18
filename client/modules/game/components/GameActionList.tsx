import { useGameStore } from '@/modules/game/store/useGameStore';
import type { FC } from 'react';
import type { Action } from '@fwo/shared';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const GameActionList: FC<{ onSelect: (action: Action) => void }> = ({ onSelect }) => {
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
