import { Placeholder } from '@/components/Placeholder';
import { wearList, wearListTranslations } from '@/constants/inventory';
import { MarketListItem } from '@/modules/market/components/MarketListItem';
import type { ItemMarket } from '@fwo/shared';
import { groupBy } from 'es-toolkit';
import type { FC } from 'react';

export const MarketList: FC<{ items: ItemMarket[] }> = ({ items }) => {
  const inventoryByWear = groupBy(items, ({ item }) => item.wear);

  return items.length ? (
    <div className="flex flex-col gap-2">
      {wearList.map(
        (wear) =>
          inventoryByWear[wear] && (
            <>
              <h5 key={wear}>{wearListTranslations[wear]}</h5>
              {inventoryByWear[wear]?.map((item) => (
                <MarketListItem key={item.id} item={item} />
              ))}
            </>
          ),
      )}
    </div>
  ) : (
    <Placeholder description="Предметов не найдено" />
  );
};
