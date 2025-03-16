import { ButtonCell, Placeholder, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import type { Action, Order } from '@fwo/shared';

const GameOrderListItem: FC<{
  order: Order;
}> = ({ order }) => {
  const target = useGameStore((state) => state.players[order.target]);

  return (
    <ButtonCell>
      <i>{order.action.displayName}</i> на <b>{target.name}</b> ({order.power}%)
    </ButtonCell>
  );
};

export const GameOrderList: FC = () => {
  const orders = useGameStore((state) => state.orders);

  return (
    <Section>
      <Section.Header>Заказы</Section.Header>

      {orders.length ? (
        orders.map((order, index) => (
          <GameOrderListItem key={`${order.action.name}:${index}`} order={order} />
        ))
      ) : (
        <Placeholder description="Сделайте заказ" />
      )}
    </Section>
  );
};
