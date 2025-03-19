import { Button } from '@/components/Button';
import { wearList, wearListTranslations } from '@/constants/inventory';
import type { FC, ReactNode } from 'react';

export const ItemsWearList: FC<{
  after?: (wear: string) => ReactNode;
  onClick: (wear: string) => void;
}> = ({ after, onClick }) => {
  return (
    <div className="flex flex-col gap-2">
      {wearList.map((wear) => (
        <Button key={wear} className="flex justify-between" onClick={() => onClick(wear)}>
          {wearListTranslations[wear]}
          {after?.(wear)}
        </Button>
      ))}
    </div>
  );
};
