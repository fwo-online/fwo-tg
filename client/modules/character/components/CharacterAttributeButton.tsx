import type { FC } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export const CharacterAttributeButton: FC<{
  label: string;

  value: number;

  canIncrease: boolean;
  canDecrease: boolean;

  onIncrease: () => void;
  onDecrease: () => void;
}> = ({ label, value, canIncrease, canDecrease, onIncrease, onDecrease }) => {
  return (
    <Card className="border-2 p-1! flex flex-1 flex-col items-center gap-0">
      <div className="text-center leading-none">
        <div className="font-bold">{label}</div>
      </div>

      <div className="text-2xl font-bold mb-2">{value}</div>

      <div className="grid grid-cols-2 gap-0 w-full">
        <Button className="h-8 m-0 p-0" disabled={!canDecrease} onClick={onDecrease}>
          −
        </Button>

        <Button className="h-8 m-0 p-0 is-primary" disabled={!canIncrease} onClick={onIncrease}>
          +
        </Button>
      </div>
    </Card>
  );
};
