import { GameStatus } from '@/modules/game/components/GameStatus';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderModal } from '../components/GameOrderModal';
import { useGameState } from '../hooks/useGameState';
import { useGameClosingConfirmation } from '../hooks/useGameClosingConfirmation';
import { Card } from '@/components/Card';
import { useUnmountEffect } from '@/hooks/useUnmountEffect';
import { Placeholder } from '@/components/Placeholder';

export function GamePage() {
  const round = useGameStore((state) => state.round);
  const reset = useGameStore((state) => state.reset);

  useGameState();
  useGameClosingConfirmation();

  useUnmountEffect(reset);

  return (
    <>
      <GameOrderModal />
      {round ? (
        <Card className="m-4" header={<>Раунд {round}</>}>
          <GameStatus />
        </Card>
      ) : (
        <Placeholder description="Игра начинается..." />
      )}
    </>
  );
}
