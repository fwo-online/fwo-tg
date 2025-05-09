import classNames from 'classnames';
import { type FC, useState } from 'react';
import { useInterval } from 'react-use';

const threshold = 1000;

export const GameOrderProgress: FC<{ ordersTime: number; ordersTimeStart: number }> = ({
  ordersTime,
  ordersTimeStart,
}) => {
  const [remainTime, setRemainTime] = useState(ordersTime);

  useInterval(() => {
    setRemainTime(ordersTimeStart + ordersTime - Date.now() - threshold);
  }, 100);

  return (
    <progress
      className={classNames('nes-progress h-4', {
        'is-success': remainTime >= ordersTime * 0.25,
        'is-warning': remainTime < ordersTime * 0.25,
      })}
      value={remainTime}
      max={ordersTime}
    />
  );
};
