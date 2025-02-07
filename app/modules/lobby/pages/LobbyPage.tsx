import { LobbyMessageComponent } from '@/components/Lobby/LobbyMessage';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { CharacterPublic, ServerToClientMessage } from '@fwo/schemas';
import { ButtonCell, Cell, List } from '@telegram-apps/telegram-ui';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function LobbyPage() {
  const socket = useWebSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<string[]>([]);

  const handleEnterLobby = useCallback((character: CharacterPublic) => {
    setMessages((messages) => messages.concat(`${character.name} подключается к лобби`));
  }, []);

  const handleLeaveLobby = useCallback((character: CharacterPublic) => {
    setMessages((messages) => messages.concat(`${character.name} покидает лобби`));
  }, []);

  useEffect(() => {
    socket.on('lobby:enter', handleEnterLobby);
    socket.on('lobby:leave', handleLeaveLobby);

    return () => {
      socket.off('lobby:enter', handleEnterLobby);
      socket.off('lobby:leave', handleLeaveLobby);
    };
  }, [socket, handleEnterLobby, handleLeaveLobby]);

  useEffect(() => {
    socket.emit('lobby:enter');

    return () => {
      socket.emit('lobby:leave');
    };
  }, []);

  const handleClick = async () => {
    socket.emit('matchMaking:start');
  };

  return (
    <List>
      {messages.map(
        (message, index) =>
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          message,
      )}

      <ButtonCell onClick={() => navigate('/game/test')}>debug game</ButtonCell>
      <ButtonCell onClick={() => handleClick()}>Начать поиск игры</ButtonCell>
    </List>
  );
}
