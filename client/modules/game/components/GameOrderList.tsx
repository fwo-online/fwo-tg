import type { FC } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import type { Order } from '@fwo/shared';
import { Placeholder } from '@/components/Placeholder';
import { Button } from '@/components/Button';

type Props = {
  isPending?: boolean;
} & ({ readonly: true; onRemove?: never } | { readonly?: never; onRemove: (id: string) => void });

const GameOrderListItem: FC<Props & { order: Order }> = ({
  order,
  isPending,
  onRemove,
  readonly,
}) => {
  const target = useGameStore((state) => state.players[order.target]);
  const handleRemove = () => {
    onRemove?.(order.id);
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <span className="mt-2">
        <i>{order.action.displayName}</i> на <b>{target.name}</b> ({order.power}%)
      </span>
      {readonly ? null : (
        <Button className="p-0 h-6 w-6 after:hidden" disabled={isPending} onClick={handleRemove}>
          ✖
        </Button>
      )}
    </div>
  );
};

export const GameOrderList: FC<Props> = (props) => {
  const orders = useGameStore((state) => state.orders);

  return (
    <>
      {orders.length ? (
        orders.map((order) => <GameOrderListItem key={order.id} order={order} {...props} />)
      ) : (
        <Placeholder description="Выберите действия" />
      )}
    </>
  );
};
