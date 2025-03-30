import { Button } from '@/components/Button';
import { type ChangeEventHandler, type FC, useState } from 'react';

export const ClanGold: FC<{
  onAddGold: (gold: number) => void;
}> = ({ onAddGold }) => {
  const [adding, setAdding] = useState(false);
  const [gold, setGold] = useState('');

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (Number.isNaN(e.target.valueAsNumber) && e.target.value) {
      return;
    }

    setGold(e.target.valueAsNumber.toString());
  };

  const handleAddGold = () => {
    const goldNumber = Number(gold);
    if (!Number.isNaN(goldNumber) && goldNumber) {
      onAddGold(goldNumber);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {adding ? (
        <>
          <input
            className="nes-input w-24 h-11"
            type="number"
            inputMode="numeric"
            min={0}
            value={gold}
            placeholder="Золото"
            onChange={handleChange}
          />
          <div className="flex items-center gap-4">
            <div className="flex gap-4 ">
              <Button className="is-success" disabled={!gold} onClick={handleAddGold}>
                ✔
              </Button>
              <Button className="is-error" onClick={() => setAdding(false)}>
                ✖
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Button onClick={() => setAdding(true)}>Пополнить</Button>
      )}
    </div>
  );
};
