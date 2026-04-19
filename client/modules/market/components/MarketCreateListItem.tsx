import type { ItemWithID } from '@fwo/shared';
import { type ChangeEventHandler, type FC, useState } from 'react';
import { Button } from '@/components/Button';
import { useCharacterInventory } from '@/modules/character/hooks/useCharacterInventory';
import { ItemModal } from '@/modules/items/components/ItemModal';
import { useMarketItemCreate } from '@/modules/market/hooks/useMarketItemCreate';

export const MarketCreateListItem: FC<{ item: ItemWithID }> = ({ item }) => {
  const { equipment } = useCharacterInventory();
  const isEquipped = equipment.includes(item.id);
  const { createItem, isPending } = useMarketItemCreate();
  const [price, setPrice] = useState<string>('');
  const minPrice = Math.ceil(item.price * 0.25);
  const maxPrice = Math.ceil(item.price * 2);

  const handleCreateItem = () => {
    if (Number.isNaN(Number(price)) || !price) {
      return;
    }

    createItem(item.id, Number(price));
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.value === '') {
      setPrice('');
      return;
    }

    if (Number.isNaN(Number(e.target.value))) {
      return;
    }

    setPrice(e.target.value);
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
          {price ? (
            <h5>Ты получишь {Math.round(Number(price) * 0.8)}💰</h5>
          ) : (
            <h5>Ты получишь 80% от указанной цены</h5>
          )}
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
