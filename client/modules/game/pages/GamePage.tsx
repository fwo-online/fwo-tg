import { GameStatus } from '@/modules/game/components/GameStatus';
import { Placeholder } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderModal } from '../components/GameOrderModal';
import { useGameState } from '../hooks/useGameState';
import { useGameClosingConfirmation } from '../hooks/useGameClosingConfirmation';
import { Card } from '@/components/Card';
import { useUnmount } from '@/hooks/useUnmount';

export function GamePage() {
  const round = useGameStore((state) => state.round);
  const reset = useGameStore((state) => state.reset);

  useGameState();
  useGameClosingConfirmation();

  useUnmount(reset);

  return (
    <>
      <GameOrderModal />
      <Card className="m-4" header={<>Раунд {round}</>}>
        {round ? <GameStatus /> : <Placeholder header="Игра начинается" />}
      </Card>
    </>
  );
}
