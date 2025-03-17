import { GameStatus } from '@/modules/game/components/GameStatus';
import { List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderModal } from '../components/GameOrderModal';
import { useGameState } from '../hooks/useGameState';
import { useGameClosingConfirmation } from '../hooks/useGameClosingConfirmation';
import { Card } from '@/components/Card';

export function GamePage() {
  const round = useGameStore((state) => state.round);

  useGameState();
  useGameClosingConfirmation();

  return (
    <>
      <GameOrderModal />
      <Card className="m-4" header={<>Раунд {round}</>}>
        {round ? <GameStatus /> : <Placeholder header="Игра начинается" />}
      </Card>
    </>
  );
}
