import { Button, FixedLayout, List, Modal } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { GameOrderList } from '@/modules/game//components/GameOrderList';
import { GameOrder } from './GameOrder';

export function GameOrderModal() {
  const [open, setOpen] = useState(true);
  const canOrder = useGameStore((state) => state.canOrder);

  return (
    <Modal
      open={canOrder && open}
      onOpenChange={setOpen}
      trigger={
        <FixedLayout vertical="bottom">
          <List>
            <Button stretched disabled={!canOrder} onClick={() => setOpen(!open)}>
              {canOrder ? 'Сделать заказ' : 'Ожидание стадии заказов'}
            </Button>
          </List>
        </FixedLayout>
      }
    >
      <List>
        <GameOrderList />
        <GameOrder />
      </List>
    </Modal>
  );
}
