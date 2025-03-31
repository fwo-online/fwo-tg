import { Button } from '@/components/Button';
import { useClanStore } from '@/modules/clan/contexts/useClan';
import { useClanGold } from '@/modules/clan/hooks/useClanGold';
import { type ChangeEventHandler, type FC, useState } from 'react';

export const ClanGold: FC = () => {
  const [adding, setAdding] = useState(false);
  const [goldToAdd, setGoldToAdd] = useState('');
  const { addGold } = useClanGold();
  const gold = useClanStore((state) => state.clan.gold);
  const loading = useClanStore((state) => state.loading);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (Number.isNaN(e.target.valueAsNumber) && e.target.value) {
      return;
    }

    setGoldToAdd(e.target.valueAsNumber.toString());
  };

  const handleAddGold = () => {
    const goldNumber = Number(goldToAdd);
    if (!Number.isNaN(goldNumber) && goldNumber) {
      addGold(goldNumber);
    }
  };

  return (
    <div className="flex justify-between items-center">
      {gold}💰
      <div className="flex items-center gap-2">
        {adding ? (
          <>
            <input
              className="nes-input w-26 h-11"
              type="number"
              inputMode="numeric"
              min={0}
              value={goldToAdd}
              placeholder="Золото"
              onChange={handleChange}
            />
            <div className="flex items-center gap-4">
              <div className="flex gap-4 ">
                <Button
                  className="is-success"
                  disabled={!goldToAdd || loading}
                  onClick={handleAddGold}
                >
                  ✔
                </Button>
                <Button className="is-error" disabled={loading} onClick={() => setAdding(false)}>
                  ✖
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Button onClick={() => setAdding(true)}>Пополнить</Button>
        )}
      </div>
    </div>
  );
};
