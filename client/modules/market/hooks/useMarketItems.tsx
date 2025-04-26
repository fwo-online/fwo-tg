import { getMarketItems } from '@/api/market';
import useSWR from 'swr';

export const useMarketItems = () => {
  const { data: marketItems } = useSWR('marketItems', getMarketItems, { suspense: true });

  return { marketItems };
};
