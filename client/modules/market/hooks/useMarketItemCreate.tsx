import { createMarketItem } from '@/api/market';
import { useRequest } from '@/hooks/useRequest';
import { mutate } from 'swr';

export const useMarketItemCreate = () => {
  const [isPending, makeRequest] = useRequest();

  const createItem = async (itemID: string, price: number) => {
    await makeRequest(() => createMarketItem(itemID, price));
    mutate('marketItems');
    await mutate('character');
  };

  return {
    isPending,
    createItem,
  };
};
