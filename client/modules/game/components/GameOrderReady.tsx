import { Button } from '@/components/Button';
import { useGameOrderReady } from '@/modules/game/hooks/useGameOrderReady';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { clsx } from 'clsx';

export const GameOrderReady = () => {
  const { isReady, handleReady, isPending } = useGameOrderReady();
  const canOrder = useGameStore((state) => state.canOrder);

  return !isReady ? (
    <Button
      onClick={handleReady}
      className={clsx('is-success mb-2', { invisible: !canOrder })}
      disabled={isPending}
    >
      Завершить ход
    </Button>
  ) : (
    <Button
      onClick={handleReady}
      className={clsx('is-error mb-2', { invisible: !canOrder })}
      disabled={isPending}
    >
      Продолжить ход
    </Button>
  );
};
