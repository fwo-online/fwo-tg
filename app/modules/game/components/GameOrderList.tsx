import { ButtonCell, Placeholder, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';

export const GameOrderList: FC<{
  onClear?: () => void;
  onRepeat?: () => void;
}> = () => {
  const orders = useGameStore((state) => state.orders);

  return (
    <Section>
      <Section.Header>Заказы</Section.Header>

      {orders.length ? (
        orders.map((order) => (
          <ButtonCell key={order.action}>
            {order.action} на {order.target} ({order.power})
          </ButtonCell>
        ))
      ) : (
        <Placeholder description="Сделайте заказ" />
      )}
    </Section>
  );
};
