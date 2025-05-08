import { buyMarketItem } from '@/api/market';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { mutate } from 'swr';

export const useMarketItemBuy = () => {
  const popup = usePopup();
  const [isPending, makeRequest] = useRequest();

  const buyItem = async (itemId: string) => {
    popup.confirm({
      message: 'Вы уверены, что хотите купить этот предмет?',
      onConfirm: async () => {
        await makeRequest(() => buyMarketItem(itemId));
        mutate('marketItems');
        await mutate('character');
      },
    });
  };

  return {
    buyItem,
    isPending,
  };
};
