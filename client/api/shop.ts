import { client, createRequest } from '@/api';

export const getShopItems = async (query?: { wear: string }) => {
  return createRequest(client.shop.$get)({ query });
};
