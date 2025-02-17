import { GameStatus } from '@/modules/game/components/GameStatus';
import { FixedLayout, List, Section } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderModal } from '../components/GameOrderModal';
import { useGameState } from '../hooks/useGameState';
import { GameLog } from '../components/GameLog';
import { useGameLogState } from '../hooks/useGameLogState';

export function GamePage() {
  const round = useGameStore((state) => state.round);

  useGameState();
  useGameLogState();

  return (
    <List>
      <GameOrderModal />
      <FixedLayout vertical="top">
        <List>
          <Section>
            <Section.Header>Раунд {round}</Section.Header>
            <GameStatus />
          </Section>
        </List>
      </FixedLayout>
      <List style={{ paddingTop: '100px' }}>
        <GameLog />
      </List>
    </List>
  );
}
