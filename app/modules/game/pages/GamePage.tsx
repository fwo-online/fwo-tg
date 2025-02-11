import { GameStatus } from '@/modules/game/components/GameStatus';
import { List, Section } from '@telegram-apps/telegram-ui';
import { type ReactNode, useState } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderModal } from '../components/GameOrderModal';
import { useGameState } from '../hooks/useGameState';

export function GamePage() {
  const round = useGameStore((state) => state.round);

  const [messages, setMessages] = useState<ReactNode[]>([]);

  useGameState();

  return (
    <List>
      <Section>
        <Section.Header>Раунд {round}</Section.Header>
        <GameStatus />
        {messages.map((message, index) => message)}

        <GameOrderModal />
      </Section>
    </List>
  );
}
