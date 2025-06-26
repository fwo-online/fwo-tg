import type { Action } from '@fwo/shared';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { GameOrderList } from '@/modules/game//components/GameOrderList';
import { GameAction } from '@/modules/game/components/GameAction';
import { GameActionList } from '@/modules/game/components/GameActionList';
import { GameOrderProgress } from '@/modules/game/components/GameOrderProgress';
import { useGameActionOrder } from '@/modules/game/hooks/useGameActionOrder';
import { useGameStore } from '@/modules/game/store/useGameStore';

export function GameOrderModal() {
  const [open, setOpen] = useState(true);
  const canOrder = useGameStore((state) => state.canOrder);
  const [selectedAction, setSelectedAction] = useState<Action>();
  const handleResetAction = () => {
    setSelectedAction(undefined);
  };

  const { isPending, handleOrder, handleRepeat, handleReset, handleRemove } =
    useGameActionOrder(handleResetAction);

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
          <GameOrderList isPending={isPending} onRemove={handleRemove} />
          <GameOrderProgress />
          {selectedAction ? (
            <GameAction
              isPending={isPending}
              action={selectedAction}
              onOrder={handleOrder}
              onCancel={handleResetAction}
            />
          ) : (
            <GameActionList
              isPending={isPending}
              onSelect={setSelectedAction}
              onRepeat={handleRepeat}
              onReset={handleReset}
            />
          )}
        </div>
      </Card>
    </Modal>
  );
}
