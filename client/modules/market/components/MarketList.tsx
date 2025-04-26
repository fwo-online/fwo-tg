import { Placeholder } from '@/components/Placeholder';
import { MarketListItem } from '@/modules/market/components/MarketListItem';
import type { ItemMarket } from '@fwo/shared';
import type { FC } from 'react';

export const MarketList: FC<{ items: ItemMarket[] }> = ({ items }) => {
  return items.length ? (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <MarketListItem key={item.id} item={item} />
      ))}
    </div>
  ) : (
    <Placeholder description="Предметов не найдено" />
  );
};
