import { GameStatus } from '@/modules/game/components/GameStatus';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderModal } from '../components/GameOrderModal';
import { useGameState } from '../hooks/useGameState';
import { useGameClosingConfirmation } from '../hooks/useGameClosingConfirmation';
import { Card } from '@/components/Card';
import { useUnmountEffect } from '@/hooks/useUnmountEffect';
import { Placeholder } from '@/components/Placeholder';
import { GameOrderList } from '@/modules/game/components/GameOrderList';
import { GameOrderProgress } from '@/modules/game/components/GameOrderProgress';
import { GameOrderReady } from '@/modules/game/components/GameOrderReady';
import { useHasScroll } from '@/hooks/useHasScroll';
import { useRef } from 'react';
import { Button } from '@/components/Button';

export function GamePage() {
  const round = useGameStore((state) => state.round);
  const reset = useGameStore((state) => state.reset);
  const canOrder = useGameStore((state) => state.canOrder);
  const statusRef = useRef<HTMLDivElement>(null);
  const hasScroll = useHasScroll(statusRef);

  const handleScroll = () => {
    statusRef.current?.scrollBy({ top: statusRef.current.clientHeight, behavior: 'smooth' });
  };

  useGameState();
  useGameClosingConfirmation();

  useUnmountEffect(reset);

  return (
    <div className="flex flex-col h-full justify-between">
      {round ? (
        <div className="flex flex-col gap-2 m-4 basis-full overflow-hidden">
          <div className="flex gap-2">
            <h2 className="text-nowrap">Раунд {round}</h2>
            {canOrder ? <GameOrderProgress /> : null}
          </div>
          <Card className="basis-full overflow-auto" ref={statusRef}>
            <GameStatus />
            <GameStatus />
            <GameStatus />
            <GameStatus />
            {hasScroll ? (
              <Button className="sticky bottom-0 w-full left-0 right-0 p-0" onClick={handleScroll}>
                ↓
              </Button>
            ) : null}
          </Card>
        </div>
      ) : (
        <Placeholder description="Игра начинается..." />
      )}
      {round ? (
        <div className="flex flex-col gap-4 m-4">
          <Card header="Выбранные действия">
            <GameOrderList readonly />
          </Card>

          <div className="flex flex-col gap-2 mt-auto">
            <GameOrderModal />

            <GameOrderReady />
          </div>
        </div>
      ) : null}
    </div>
  );
}
