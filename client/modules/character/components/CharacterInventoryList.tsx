import { type FC, Fragment } from 'react';
import { Placeholder } from '@/components/Placeholder';
import { wearList, wearListTranslations } from '@/constants/inventory';
import { CharacterInventoryComponents } from '@/modules/character/components/CharacterInventoryComponents';
import { CharacterInventoryListItem } from '@/modules/character/components/CharacterInventoryListItem';
import { useCharacterInventory } from '@/modules/character/hooks/useCharacterInventory';

export const CharacterInventoryList: FC = () => {
  const { items, inventoryByWear } = useCharacterInventory();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h5>Компоненты</h5>
        <CharacterInventoryComponents />
      </div>
      {items.length ? (
        wearList.map(
          (wear) =>
            inventoryByWear[wear] && (
              <Fragment key={wear}>
                <h5>{wearListTranslations[wear]}</h5>
                {inventoryByWear[wear]?.map((item) => (
                  <CharacterInventoryListItem key={item.id} item={item} />
                ))}
              </Fragment>
            ),
        )
      ) : (
        <Placeholder description="Ничего не найдено" />
      )}
    </div>
  );
};
