import { client, createRequest } from '@/api';

export const getShopItems = async (query?: { wear: string; tier: number }) => {
  return createRequest(client.shop.$get)({ query });
};
