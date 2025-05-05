import type { FC } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import type { Order } from '@fwo/shared';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';

const GameOrderListItem: FC<{
  order: Order;
}> = ({ order }) => {
  const target = useGameStore((state) => state.players[order.target]);

  return (
    <div>
      <i>{order.action.displayName}</i> на <b>{target.name}</b> ({order.power}%)
    </div>
  );
};

export const GameOrderList: FC = () => {
  const orders = useGameStore((state) => state.orders);

  return (
    <Card header="Заказы">
      {orders.length ? (
        orders.map((order, index) => (
          <GameOrderListItem key={`${order.action.name}:${index}`} order={order} />
        ))
      ) : (
        <Placeholder description="Сделайте заказ" />
      )}
    </Card>
  );
};
