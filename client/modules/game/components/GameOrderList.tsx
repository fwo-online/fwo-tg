import type { FC } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import type { Order } from '@fwo/shared';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { Button } from '@/components/Button';

const GameOrderListItem: FC<{
  order: Order;
  isPending: boolean;
  onRemove: (id: string) => void;
}> = ({ order, isPending, onRemove }) => {
  const target = useGameStore((state) => state.players[order.target]);
  const handleRemove = () => {
    onRemove(order.id);
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <span>
        <i>{order.action.displayName}</i> на <b>{target.name}</b> ({order.power}%)
      </span>
      <Button className="p-0 h-6 w-6 after:hidden" disabled={isPending} onClick={handleRemove}>
        ✖
      </Button>
    </div>
  );
};

export const GameOrderList: FC<{ isPending: boolean; onRemove: (id: string) => void }> = ({
  isPending,
  onRemove,
}) => {
  const orders = useGameStore((state) => state.orders);

  return (
    <Card header="Заказы">
      {orders.length ? (
        orders.map((order) => (
          <GameOrderListItem
            key={order.id}
            order={order}
            isPending={isPending}
            onRemove={onRemove}
          />
        ))
      ) : (
        <Placeholder description="Сделайте заказ" />
      )}
    </Card>
  );
};
