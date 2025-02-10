import { LobbyMessageComponent } from '@/components/Lobby/LobbyMessage';
import { useCharacter } from '@/hooks/useCharacter';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { CharacterPublic, ServerToClientMessage } from '@fwo/schemas';
import { ButtonCell, Text, List, Section, Info, Cell } from '@telegram-apps/telegram-ui';
import { type ReactNode, use, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function LobbyPage() {
  const socket = useWebSocket();
  const { character } = useCharacter();

  const [characters, setCharacters] = useState<CharacterPublic[]>([]);
  const [messages, setMessages] = useState<ReactNode[]>([]);
  const navigate = useNavigate();

  const isSearching = characters.some(({ id }) => id === character.id);

  const handleStartMatchMaking = useCallback((character: CharacterPublic) => {
    setMessages((messages) =>
      messages.concat(
        <Text>
          <Text weight="3">
            {character.name} ({character.lvl})
          </Text>{' '}
          начал поиск игры
        </Text>,
      ),
    );
  }, []);

  const handleStopMatchMaking = useCallback((character: CharacterPublic) => {
    setMessages((messages) =>
      messages.concat(
        <Text>
          <Text weight="3">
            {character.name} ({character.lvl})
          </Text>{' '}
          покидает лобби
        </Text>,
      ),
    );
  }, []);

  useEffect(() => {
    socket.on('lobby:list', setCharacters);
    socket.on('lobby:start', handleStartMatchMaking);
    socket.on('lobby:stop', handleStopMatchMaking);

    return () => {
      socket.off('lobby:start', handleStartMatchMaking);
      socket.off('lobby:start', handleStopMatchMaking);
    };
  }, [socket, handleStartMatchMaking, handleStopMatchMaking]);

  useEffect(() => {
    socket.emitWithAck('lobby:enter').then(setCharacters);
    socket.on('lobby:list', setCharacters);

    return () => {
      socket.off('lobby:list', setCharacters);
      socket.emit('lobby:leave');
    };
  }, [socket.emit, socket.on, socket.emitWithAck, socket.off]);

  const handleClick = async () => {
    if (isSearching) {
      socket.emit('lobby:stop');
    } else {
      socket.emit('lobby:start');
    }
  };

  return (
    <List>
      <Section>
        {characters.map((character) => (
          <Cell key={character.name}>
            <Info type="text">
              {character.name}({character.lvl})
            </Info>
          </Cell>
        ))}
      </Section>
      {messages.map((message, index) => message)}

      <ButtonCell onClick={() => navigate('/game/123')}>Debug</ButtonCell>
      {isSearching ? (
        <ButtonCell mode="destructive" onClick={() => handleClick()}>
          Остановить поиск игры
        </ButtonCell>
      ) : (
        <ButtonCell onClick={() => handleClick()}>Начать поиск игры</ButtonCell>
      )}
    </List>
  );
}
