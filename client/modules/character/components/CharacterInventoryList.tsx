import type { FC } from 'react';
import { Placeholder } from '@/components/Placeholder';
import { useCharacterInventory } from '../hooks/useCharacterInventory';
import { wearList, wearListTranslations } from '@/constants/inventory';
import { CharacterInventoryListItem } from '@/modules/character/components/CharacterInventoryListItem';
import { CharacterInventoryComponents } from '@/modules/character/components/CharacterInventoryComponents';

export const CharacterInventoryList: FC = () => {
  const { items, inventoryByWear } = useCharacterInventory();

  return items.length ? (
    <div className="flex flex-col gap-2">
      <div>
        <h5>Компоненты</h5>
        <CharacterInventoryComponents />
      </div>
      {wearList.map(
        (wear) =>
          inventoryByWear[wear] && (
            <>
              <h5 key={wear}>{wearListTranslations[wear]}</h5>
              {inventoryByWear[wear]?.map((item) => (
                <CharacterInventoryListItem key={item.id} item={item} />
              ))}
            </>
          ),
      )}
    </div>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
