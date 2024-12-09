import { useWebSocket } from '@/hooks/useWebSocket';
import type { ServerToClientMessage } from '@fwo/schemas';
import { ButtonCell, Cell, List } from '@telegram-apps/telegram-ui';
import { useCallback, useEffect, useState } from 'react';

export function LobbyPage() {
  const { ws } = useWebSocket();

  const [messages, setMessages] = useState<ServerToClientMessage[]>([]);

  const handleMessage = useCallback((message: ServerToClientMessage) => {
    setMessages((messages) => messages.concat(message));
  }, []);

  useEffect(() => {
    const unsubscribe = ws.subscribe(handleMessage);

    return () => unsubscribe();
  }, [ws, handleMessage]);

  useEffect(() => {
    ws.send({ type: 'lobby', action: 'enter' });

    return () => {
      ws.send({ type: 'lobby', action: 'leave' });
      ws.send({ type: 'match_making', action: 'stop_search' });
    };
  }, [ws]);

  const handleClick = async () => {
    ws.send({ type: 'match_making', action: 'start_search' });
  };

  return (
    <List>
      {messages.map((message, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <Cell key={index}>{JSON.stringify(message)}</Cell>
      ))}

      <ButtonCell onClick={() => handleClick()}>Начать поиск игры</ButtonCell>
    </List>
  );
}
