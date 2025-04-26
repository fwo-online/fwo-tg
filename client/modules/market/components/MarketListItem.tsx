import { Button } from '@/components/Button';
import { useCharacter } from '@/contexts/character';
import { ItemModal } from '@/modules/items/components/ItemModal';
import { useMarketItemBuy } from '@/modules/market/hooks/useMarketItemBuy';
import { useMarketItemDelete } from '@/modules/market/hooks/useMarketItemDelete';
import type { ItemMarket } from '@fwo/shared';
import type { FC } from 'react';

export const MarketListItem: FC<{ item: ItemMarket }> = ({ item }) => {
  const { character } = useCharacter();
  const { buyItem, isPending: isBuying } = useMarketItemBuy();
  const { deleteItem, isPending: isDeleting } = useMarketItemDelete();

  return (
    <ItemModal
      item={item.item}
      showComponents={false}
      trigger={<Button className="text-start">{item.item.info.name}</Button>}
      footer={
        item.seller.id === character.id ? (
          <div className="flex flex-col">
            <Button
              className="flex-1"
              disabled={isBuying || isDeleting}
              onClick={() => deleteItem(item.id)}
            >
              Снять с продажи
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h5 className="text-sm">Продавец: {item.seller.name}</h5>
            <div className="flex items-center justify-between gap-4">
              <Button
                className="flex-1"
                disabled={isBuying || isDeleting}
                onClick={() => buyItem(item.id)}
              >
                Купить за {item.price}💰
              </Button>
              <div>У тебя {character.gold}💰</div>
            </div>
          </div>
        )
      }
    />
  );
};
