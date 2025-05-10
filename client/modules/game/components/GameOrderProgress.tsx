import { useGameStore } from '@/modules/game/store/useGameStore';
import classNames from 'classnames';
import { useState } from 'react';
import { useInterval } from 'react-use';

const threshold = 1000;

export const GameOrderProgress = () => {
  const ordersTime = useGameStore((state) => state.ordersTime);
  const ordersStartTime = useGameStore((state) => state.ordersStartTime);
  const [remainTime, setRemainTime] = useState(ordersTime);

  useInterval(() => {
    setRemainTime(ordersStartTime + ordersTime - Date.now() - threshold);
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
