import classNames from 'classnames';
import type { FC } from 'react';

type ActionLevelValuesProps = {
  label: string;
  values: string[] | number[];
  currentLevel?: number;
  suffix?: string;
};

export const ActionLevelValues: FC<ActionLevelValuesProps> = ({
  label,
  values,
  currentLevel = 0,
  suffix = '%',
}) => {
  return (
    <div className="flex gap-2 text-sm">
      <span>{label}:</span>

      <span className="text-zinc-400">
        {values.map((value, index) => (
          <>
            {index ? <>/</> : null}
            {index === currentLevel - 1 ? (
              <span
                className={classNames(
                  index === currentLevel - 1 &&
                    'text-(--tg-theme-text-color) underline underline-offset-4',
                )}
              >
                {value}
                {suffix}
              </span>
            ) : (
              <>
                {value}
                {suffix}
              </>
            )}
            {/* <span
            className={classNames(
              index === currentLevel - 1 &&
                'text-(--tg-theme-text-color) underline underline-offset-4',
            )}
          >
            {value}
            {suffix}
          </span> */}
          </>
        ))}
      </span>
    </div>
  );
};
