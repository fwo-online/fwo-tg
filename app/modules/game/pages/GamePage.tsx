import { GameStatusComponent } from '@/modules/game/components/GameStatus';
import { useCharacter } from '@/hooks/useCharacter';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Action, GameStatus, PublicGameStatus, ServerToClientMessage } from '@fwo/schemas';
import { popup } from '@telegram-apps/sdk-react';
import {
  ButtonCell,
  FixedLayout,
  Info,
  InlineButtons,
  List,
  Section,
  Slider,
  Title,
} from '@telegram-apps/telegram-ui';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

export function GamePage() {
  const socket = useWebSocket();
  const { gameID } = useParams();
  const { character } = useCharacter();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ReactNode[]>([]);
  const [canOrder, setCanOrder] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [magics, setMagics] = useState<Action[]>([]);
  const [skills, setSkills] = useState<Action[]>([]);
  const [power, setPower] = useState(0);
  const [remainPower, setRemainPower] = useState(100);
  const [status, setStatus] = useState<GameStatus[]>([]);
  const [statusByClan, setStatusByClan] = useState<Record<string, PublicGameStatus[]>>({});
  const [round, setRound] = useState<number>(1);
  const [selectedAction, setSelectedAction] = useState<Action>();
  const [orders, setOrders] = useState<
    {
      target: string;
      action: string;
      power: number;
    }[]
  >([]);

  const handleStartRound = useCallback(
    ({ round, status, statusByClan }: Parameters<ServerToClientMessage['game:startRound']>[0]) => {
      setRound(round);
      setStatus(status);
      setStatusByClan(statusByClan);
    },
    [],
  );

  const handlePreKick = useCallback(() => {
    popup.open({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  }, []);

  const handleKick = useCallback(async () => {
    navigate('/');
    await popup.open({ message: 'Вы были выброшены из игры' });
  }, [navigate]);

  const handleStartOrders = useCallback(
    ({ actions, magics, skills }: Parameters<ServerToClientMessage['game:startOrders']>[0]) => {
      setActions(actions);
      setMagics(magics);
      setSkills(skills);
    },
    [],
  );

  useEffect(() => {
    socket.on('game:startRound', handleStartRound);
    socket.on('game:preKick', handlePreKick);
    socket.on('game:kick', handleKick);
    socket.on('game:startOrders', handleStartOrders);

    return () => {
      socket.off('game:startRound', handleStartRound);
      socket.off('game:preKick', handlePreKick);
      socket.off('game:kick', handleKick);
      socket.off('game:startOrders', handleStartOrders);
    };
  }, [socket.on, socket.off, handleStartRound, handlePreKick, handleKick, handleStartOrders]);

  const handleClick = async () => {
    // ws.send({ type: 'match_making', action: 'start_search' });
  };

  const handleActionClick = async (target: string) => {
    if (selectedAction) {
      socket
        .emitWithAck('game:order', {
          power,
          target,
          action: selectedAction?.name,
        })
        .then((res) => {
          if (res.success) {
            setOrders(res.orders);
          } else {
            popup.open({ message: res.message });
          }
        });
    }
  };

  const handleSliderChange = (value: number) => {
    setPower(Math.min(remainPower, value));
  };

  const actionEmoji = {
    attack: '⚔️',
    protect: '🛡️',
    regeneration: '🛌',
    handsHeal: '🤲',
  };

  return (
    <List>
      <Section>
        <Section.Header>Раунд {round}</Section.Header>
      </Section>
      <GameStatusComponent status={status} />
      {messages.map((message, index) => message)}

      <Section>
        <Section.Header>Заказы</Section.Header>

        {orders.map((order) => (
          <ButtonCell key={order.action}>
            {order.action} на {order.target} ({order.power})
          </ButtonCell>
        ))}
      </Section>

      {selectedAction &&
        Object.entries(statusByClan).map(([clan, status]) => (
          <Section key={clan}>
            <Section.Header>{clan}</Section.Header>
            {status.map(({ id, name, hp }) => (
              <ButtonCell
                after={<Info type="text">❤️{hp}</Info>}
                key={id}
                onClick={() => handleActionClick(id)}
              >
                {name}
              </ButtonCell>
            ))}
          </Section>
        ))}
      <FixedLayout vertical="bottom">
        {magics.map((action) => (
          <ButtonCell key={action.name}> {action.displayName}</ButtonCell>
        ))}
        {skills.map((action) => (
          <ButtonCell key={action.name}>{action.displayName}</ButtonCell>
        ))}
        {/* <Section></Section> */}
        <InlineButtons mode="gray">
          {actions.map((action) => (
            <InlineButtons.Item key={action.name} onClick={() => setSelectedAction(action)}>
              <Title className="og">{actionEmoji[action.name]}</Title>
            </InlineButtons.Item>
          ))}
        </InlineButtons>
        <Slider
          before={power}
          after={remainPower}
          min={0}
          max={remainPower}
          value={power}
          onChange={handleSliderChange}
        />
      </FixedLayout>
    </List>
  );
}
