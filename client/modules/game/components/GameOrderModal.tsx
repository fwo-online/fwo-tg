import { useState } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderList } from '@/modules/game//components/GameOrderList';
import { GameOrder } from './GameOrder';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { GameOrderProgress } from '@/modules/game/components/GameOrderProgress';

export function GameOrderModal() {
  const [open, setOpen] = useState(true);
  const canOrder = useGameStore((state) => state.canOrder);
  const ordersTime = useGameStore((state) => state.ordersTime);
  const ordersStartTime = useGameStore((state) => state.ordersStartTime);

  return (
    <Modal
      open={canOrder && open}
      onOpenChange={setOpen}
      handleOnly
      trigger={
        <Button
          className="fixed bottom-4 left-2 right-2 is-primary"
          disabled={!canOrder}
          onClick={() => setOpen(!open)}
        >
          {canOrder ? 'Сделать заказ' : 'Ожидание стадии заказов'}
        </Button>
      }
    >
      <Card>
        <Modal.Handle />
        <div className="flex flex-col gap-2">
          <GameOrderList />
          <GameOrderProgress ordersTime={ordersTime} ordersTimeStart={ordersStartTime} />
          <GameOrder />
        </div>
      </Card>
    </Modal>
  );
}
