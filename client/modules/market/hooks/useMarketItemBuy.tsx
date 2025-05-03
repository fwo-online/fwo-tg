import { buyMarketItem } from '@/api/market';
import { useConfirm } from '@/hooks/useConfirm';
import { useRequest } from '@/hooks/useRequest';
import { mutate } from 'swr';

export const useMarketItemBuy = () => {
  const { confirm } = useConfirm();
  const [isPending, makeRequest] = useRequest();

  const buyItem = async (itemId: string) => {
    confirm({
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
