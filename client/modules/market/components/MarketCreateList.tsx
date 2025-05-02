import type { FC } from 'react';
import { Placeholder } from '@/components/Placeholder';
import { wearList, wearListTranslations } from '@/constants/inventory';
import { useCharacterInventory } from '@/modules/character/hooks/useCharacterInventory';
import { MarketCreateListItem } from '@/modules/market/components/MarketCreateListItem';

export const MarketCreateList: FC = () => {
  const { items, inventoryByWear } = useCharacterInventory();
  const itemsToSell = items.filter(({ tier }) => tier > 0);

  return (
    <div className="flex flex-col gap-2">
      {itemsToSell.length ? (
        wearList.map(
          (wear) =>
            inventoryByWear[wear] && (
              <>
                <h5 key={wear}>{wearListTranslations[wear]}</h5>
                {inventoryByWear[wear]?.map((item) => (
                  <MarketCreateListItem key={item.id} item={item} />
                ))}
              </>
            ),
        )
      ) : (
        <Placeholder description="Ничего не найдено" />
      )}
    </div>
  );
};
