import type { Item } from '@fwo/shared';
import { use, type FC } from 'react';
import { buyItem } from '@/api/character';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { ItemModal } from '@/modules/items/components/ItemsModal';
import { useCharacter } from '@/contexts/character';
import { useRequest } from '@/hooks/useRequest';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { useModal } from '@/contexts/modal';

export const ShopList: FC<{ shopPromise: Promise<Item[]> }> = ({ shopPromise }) => {
  const items = use(shopPromise);
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();
  const [_, makeRequest] = useRequest();
  const { showInfoModal } = useModal();

  const canBuy = (item: Item) => character.gold >= item.price;

  const handleBuy = async (item: Item) => {
    makeRequest(async () => {
      await buyItem(item.code);
      showInfoModal({ message: `Ты купил ${item.info.name}` });
      await updateCharacter();
    });
  };

  return items.length ? (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <ItemModal
          key={item.code}
          item={item}
          trigger={<Button className="text-start">{item.info.name}</Button>}
          footer={
            <div className="flex items-center justify-between gap-4">
              <Button className="flex-1" disabled={!canBuy(item)} onClick={() => handleBuy(item)}>
                Купить за {item.price}💰
              </Button>
              <div>У тебя {character.gold}💰</div>
            </div>
          }
        />
      ))}
    </div>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
