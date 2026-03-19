import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';

const threshold = 1000;

export const GameOrderProgress = () => {
  const ordersTime = useGameStore((state) => state.ordersTime);
  const ordersStartTime = useGameStore((state) => state.ordersStartTime);
  const [remainTime, setRemainTime] = useState(ordersTime);

  useEffect(() => {
    const interval = setInterval(
      () => setRemainTime(ordersStartTime + ordersTime - Date.now() - threshold),
      100,
    );

    return () => clearInterval(interval);
  });

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
