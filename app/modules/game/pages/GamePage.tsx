import { GameStatus } from '@/modules/game/components/GameStatus';
import { List, Section } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderModal } from '../components/GameOrderModal';
import { useGameState } from '../hooks/useGameState';

export function GamePage() {
  const round = useGameStore((state) => state.round);

  useGameState();

  return (
    <List>
      <GameOrderModal />
      <Section>
        <Section.Header>Раунд {round}</Section.Header>
        <Section.Header>Статус</Section.Header>
        <GameStatus />
      </Section>
    </List>
  );
}
