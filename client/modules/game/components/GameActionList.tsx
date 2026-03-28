import type { Action } from '@fwo/shared';
import classNames from 'classnames';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useGameStore } from '@/modules/game/store/useGameStore';

export const GameActionList: FC<{
  isPending: boolean;
  onSelect: (action: Action) => void;
  onRepeat: () => void;
  onReset: () => void;
  onReady: () => void;
}> = ({ isPending, onSelect, onRepeat, onReset, onReady }) => {
  const round = useGameStore((state) => state.round);
  const actions = useGameStore((state) => state.actions);
  const magics = useGameStore((state) => state.magics);
  const skills = useGameStore((state) => state.skills);
  const actionPoints = useGameStore((state) => state.ap);
  const maxActionPoints = useGameStore((state) => state.maxAP);

  const isActionDisabled = (action: Action) => action.ap > actionPoints;

  return (
    <Card header="Действия">
      <div className="mb-2 text-sm">
        ОД: {actionPoints}/{maxActionPoints}
      </div>
      <div className="flex flex-col gap-1 max-h-75 overflow-auto">
        {actionPoints !== maxActionPoints && (
          <Button onClick={onReady} className={classNames('is-success p-0')} disabled={isPending}>
            Завершить ход
          </Button>
        )}
        {actionPoints === maxActionPoints && round > 1 && (
          <Button className="p-0 mb-4" onClick={onRepeat} disabled={isPending}>
            Повторить
          </Button>
        )}
        {actionPoints !== maxActionPoints && (
          <Button className="p-0 mb-4" onClick={onReset} disabled={isPending}>
            Очистить
          </Button>
        )}
        {actions.map((action) => (
          <Button
            className="p-0 is-primary"
            key={action.name}
            onClick={() => onSelect(action)}
            disabled={isActionDisabled(action) || isPending}
          >
            <div className="flex w-full justify-between">
              <span>{action.displayName}</span>
              <span>{action.ap} AP</span>
            </div>
          </Button>
        ))}
        {magics.length ? (
          <>
            <h6>Магии</h6>
            {magics.map((action) => (
              <Button
                key={action.name}
                className="p-0 is-primary"
                onClick={() => onSelect(action)}
                disabled={isActionDisabled(action) || isPending}
              >
                <div className="flex w-full justify-between">
                  <span>{action.displayName}</span>
                  <span>
                    {action.ap} AP · {action.cost}💧
                  </span>
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
                disabled={isActionDisabled(action) || isPending}
                onClick={() => onSelect(action)}
              >
                <div className="flex w-full justify-between">
                  <span>{action.displayName}</span>
                  <span>
                    {action.ap} AP · {action.cost}🔋
                  </span>
                </div>
              </Button>
            ))}
          </>
        ) : null}
      </div>
    </Card>
  );
};
