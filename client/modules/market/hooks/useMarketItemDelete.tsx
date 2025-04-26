import { deleteMarketItem } from '@/api/market';
import { useRequest } from '@/hooks/useRequest';
import { mutate } from 'swr';

export const useMarketItemDelete = () => {
  const [isPending, makeRequest] = useRequest();

  const deleteItem = async (itemID: string) => {
    await makeRequest(() => deleteMarketItem(itemID));
    mutate('marketItems');
    await mutate('character');
  };

  return {
    isPending,
    deleteItem,
  };
};
