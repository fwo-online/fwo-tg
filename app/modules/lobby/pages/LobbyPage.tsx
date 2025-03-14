import { characterClassNameMap } from '@/constants/character';
import { useCharacter } from '@/contexts/character';
import { useWebSocket } from '@/contexts/webSocket';
import type { CharacterPublic } from '@fwo/schemas';
import { ButtonCell, List, Section, Info, Cell, Placeholder } from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function LobbyPage() {
  const socket = useWebSocket();
  const { character } = useCharacter();

  const [characters, setCharacters] = useState<CharacterPublic[]>([]);

  const isSearching = characters.some(({ id }) => id === character.id);

  useEffect(() => {
    socket.on('lobby:list', setCharacters);

    return () => {
      socket.off('lobby:list', setCharacters);
    };
  }, [socket]);

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
        <Section.Header>Ищут игру</Section.Header>
        {characters.length ? (
          characters.map((character) => (
            <Cell key={character.name}>
              <Info type="text">
                {character.name} ({characterClassNameMap[character.class]} {character.lvl})
              </Info>
            </Cell>
          ))
        ) : (
          <Placeholder description="Никого нет" />
        )}
      </Section>

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
