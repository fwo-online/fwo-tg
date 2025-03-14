import { ButtonCell, Placeholder, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';

const GameOrderListItem: FC<{
  order: {
    target: string;
    action: string;
    power: number;
  };
}> = ({ order }) => {
  const target = useGameStore((state) => state.players[order.target]);

  return (
    <ButtonCell key={order.action}>
      <i>{order.action}</i> на <b>{target.name}</b> ({order.power}%)
    </ButtonCell>
  );
};

export const GameOrderList: FC = () => {
  const orders = useGameStore((state) => state.orders);

  return (
    <Section>
      <Section.Header>Заказы</Section.Header>

      {orders.length ? (
        orders.map((order) => <GameOrderListItem key={order.action} order={order} />)
      ) : (
        <Placeholder description="Сделайте заказ" />
      )}
    </Section>
  );
};
