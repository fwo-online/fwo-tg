import type { MinMax } from '@fwo/shared';
import type { FC } from 'react';
import { formatNumber } from '@/utils/formatNumber';

export const StatValue: FC<{
  value: number;
  base?: number;
}> = ({ value, base }) => {
  const diff = value - (base ?? 0);

  return (
    <div className="flex items-center gap-1">
      <span>{formatNumber(value)}</span>

      {diff !== 0 && (
        <span className={diff > 0 ? 'text-green-500' : 'text-red-500'}>
          ({diff > 0 ? '+' : ''}
          {formatNumber(diff)})
        </span>
      )}
    </div>
  );
};

export const RangeStatValue: FC<{
  value: MinMax;
  base: MinMax;
}> = ({ value, base }) => {
  const minDiff = value.min - base.min;
  const maxDiff = value.max - base.max;

  return (
    <div className="flex gap-1">
      <span>
        {value.min} - {value.max}
      </span>

      {(minDiff !== 0 || maxDiff !== 0) && (
        <span className="text-green-500">
          (+{formatNumber(minDiff)} - +{formatNumber(maxDiff)})
        </span>
      )}
    </div>
  );
};
