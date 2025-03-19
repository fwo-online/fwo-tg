import { Modal } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderList } from '@/modules/game//components/GameOrderList';
import { GameOrder } from './GameOrder';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export function GameOrderModal() {
  const [open, setOpen] = useState(true);
  const canOrder = useGameStore((state) => state.canOrder);

  return (
    <Modal
      open={canOrder && open}
      onOpenChange={setOpen}
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
        <GameOrderList />
        <GameOrder />
      </Card>
    </Modal>
  );
}
