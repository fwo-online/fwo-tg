import type { Action } from '@fwo/shared';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { GameOrderList } from '@/modules/game//components/GameOrderList';
import { GameAction } from '@/modules/game/components/GameAction';
import { GameActionList } from '@/modules/game/components/GameActionList';
import { useGameActionOrder } from '@/modules/game/hooks/useGameActionOrder';
import { useGameOrderReady } from '@/modules/game/hooks/useGameOrderReady';
import { useGameStore } from '@/modules/game/store/useGameStore';

export function GameOrderModal() {
  const [open, setOpen] = useState(true);
  const canOrder = useGameStore((state) => state.canOrder);
  const isReady = useGameStore((state) => state.ready);
  const { handleReady } = useGameOrderReady();
  const [selectedAction, setSelectedAction] = useState<Action>();
  const handleResetAction = () => {
    setSelectedAction(undefined);
  };

  const { isPending, handleOrder, handleRepeat, handleReset, handleRemove } =
    useGameActionOrder(handleResetAction);

  return (
    <Modal
      open={canOrder && !isReady && open}
      onOpenChange={setOpen}
      trigger={
        <Button
          className="is-primary"
          disabled={!canOrder || isReady}
          onClick={() => setOpen(!open)}
        >
          {canOrder ? 'Выбрать действие' : 'Ожидание стадии выбора'}
        </Button>
      }
    >
      <Card>
        <div className="flex flex-col gap-2">
          <Card header="Выбранные действия">
            <GameOrderList isPending={isPending} onRemove={handleRemove} />
          </Card>

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
              onReady={handleReady}
            />
          )}
        </div>
      </Card>
    </Modal>
  );
}
