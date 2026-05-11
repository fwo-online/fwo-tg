import { getItemPrice, type Item } from '@fwo/shared';
import { every } from 'es-toolkit/compat';
import type { FC } from 'react';
import { forgeClanItem } from '@/api/clan';
import { forgeItem } from '@/api/inventory';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';
import { ItemModal } from '@/modules/items/components/ItemModal';

export const ForgeList: FC<{ items: Item[]; clanForge?: boolean }> = ({ items, clanForge }) => {
  const gold = useCharacter((character) => character.gold);
  const components = useCharacter((character) => character.components);
  const { syncCharacter } = useSyncCharacter();
  const [_, makeRequest] = useRequest();
  const popup = usePopup();

  const canForge = (item: Item) => {
    if (gold < item.price * 0.2) {
      return false;
    }

    return every(item.craft?.components, (value, key) => (components[key] ?? 0) >= (value ?? 0));
  };

  const handleForge = async (item: Item) => {
    await makeRequest(async () => {
      if (clanForge) {
        await forgeClanItem(item.code);
      } else {
        await forgeItem(item.code);
      }
      popup.info({ message: `Ты создал ${item.info.name}` });
    });
    await syncCharacter();
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
              <Button
                className="flex-1"
                disabled={!canForge(item)}
                onClick={() => handleForge(item)}
              >
                Создать за {getItemPrice(item.price, item.tier)}💰
              </Button>
              <div>У тебя {gold}💰</div>
            </div>
          }
          showComponents
        />
      ))}
    </div>
  ) : (
    <Placeholder description="Ничего не найдено" />
  );
};
