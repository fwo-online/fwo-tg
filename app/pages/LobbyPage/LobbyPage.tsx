import { useWebSocket } from '@/hooks/useWebSocket';
import type { Action, ServerToClientMessage } from '@fwo/schemas';
import { ButtonCell, Cell, List, Slider } from '@telegram-apps/telegram-ui';
import { useCallback, useEffect, useState } from 'react';

export function LobbyPage() {
  const { ws } = useWebSocket();

  const [messages, setMessages] = useState<ServerToClientMessage[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [magics, setMagics] = useState<Action[]>([]);
  const [skills, setSkills] = useState<Action[]>([]);
  const [power, setPower] = useState(0);
  const [remainPower, setRemainPower] = useState(100);

  const handleMessage = useCallback((message: ServerToClientMessage) => {
    setMessages((messages) => messages.concat(message));
    if (message.type !== 'game') {
      return;
    }

    if (message.action === 'order') {
      setActions(message.actions);
      setMagics(message.magics);
      setSkills(message.skills);
      setRemainPower(message.proc);
    }

    if (message.action === 'endOrders') {
      setActions([]);
      setMagics([]);
      setSkills([]);
    }
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

  const handleActionClick = async (action: Action) => {
    ws.send({
      type: 'game',
      action: 'order',
      order: {
        action: action.name,
        target: '675834439ab73b12ebe8a44c',
        proc: power,
      },
    });
  };

  const handleSliderChange = (value: number) => {
    setPower(Math.min(remainPower, value));
  };

  return (
    <List>
      {messages.map((message, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <Cell key={index}>{JSON.stringify(message)}</Cell>
      ))}

      <ButtonCell onClick={() => handleClick()}>Начать поиск игры</ButtonCell>

      {actions.map((action) => (
        <ButtonCell onClick={() => handleActionClick(action)} key={action.name}>
          {action.name}
        </ButtonCell>
      ))}
      <Slider onChange={handleSliderChange} />
    </List>
  );
}