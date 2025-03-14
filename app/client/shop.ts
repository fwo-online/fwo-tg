import { client, createRequest } from '@/client';

export const getShopItems = async (query?: { wear: string }) => {
  return createRequest(client.shop.$get)({ query });
};
