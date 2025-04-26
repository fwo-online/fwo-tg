import { type ChangeEventHandler, useState, type FC } from 'react';
import { ItemModal } from '@/modules/items/components/ItemModal';
import { Button } from '@/components/Button';

import type { Item } from '@fwo/shared';
import { useCharacterInventory } from '@/modules/character/hooks/useCharacterInventory';
import { useMarketItemCreate } from '@/modules/market/hooks/useMarketItemCreate';

export const MarketCreateListItem: FC<{ item: Item }> = ({ item }) => {
  const { equipment } = useCharacterInventory();
  const isEquipped = equipment.includes(item.id);
  const { createItem, isPending } = useMarketItemCreate();
  const [price, setPrice] = useState<string>('');
  const minPrice = item.price / 0.25;
  const maxPrice = item.price * 2;

  const handleCreateItem = () => {
    if (Number.isNaN(Number(price)) || !price) {
      return;
    }

    createItem(item._id, Number(price));
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (Number.isNaN(e.target.valueAsNumber) && e.target.value) {
      return;
    }

    setPrice(e.target.valueAsNumber.toString());
  };

  return (
    <ItemModal
      key={item.id}
      item={item}
      trigger={
        <Button disabled={isEquipped}>
          <div className="flex justify-between">
            {item.info.name}
            <div className="opacity-50">{isEquipped && 'Надето'}</div>
          </div>
        </Button>
      }
      footer={
        <div className="flex flex-col gap-2">
          <input
            value={price}
            className="nes-input"
            inputMode="numeric"
            type="number"
            min={minPrice}
            max={maxPrice}
            placeholder={`Введите цену от ${minPrice} до ${maxPrice}`}
            onChange={handleChange}
          />
          <Button disabled={isPending} onClick={handleCreateItem}>
            Выставить на продажу
          </Button>
        </div>
      }
    />
  );
};
