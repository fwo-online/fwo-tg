import type { FC } from 'react';
import { ItemModal } from '@/modules/items/components/ItemModal';

import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { useCharacterInventory } from '../hooks/useCharacterInventory';
import { wearList, wearListTranslations } from '@/constants/inventory';

export const CharacterInventoryList: FC = () => {
  const { items, equipment, inventoryByWear, handleEquip, handleUnEquip } = useCharacterInventory();

  return items.length ? (
    <div className="flex flex-col gap-2">
      {wearList.map(
        (wear) =>
          inventoryByWear[wear] && (
            <>
              <h6 key={wear}>{wearListTranslations[wear]}</h6>
              {inventoryByWear[wear]?.map((item) => (
                <ItemModal
                  key={item.id}
                  item={item}
                  trigger={
                    <Button>
                      <div className="flex justify-between">
                        {item.info.name}
                        <div className="opacity-50">
                          {equipment[wear]?.id === item.id && 'Надето'}
                        </div>
                      </div>
                    </Button>
                  }
                  footer={
                    equipment[wear]?.id === item.id ? (
                      <Button onClick={() => handleUnEquip(item.id)}>Снять</Button>
                    ) : (
                      <Button onClick={() => handleEquip(item.id)}>Надеть</Button>
                    )
                  }
                />
              ))}
            </>
          ),
      )}
    </div>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
