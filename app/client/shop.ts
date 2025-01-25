import { client } from '@/client';

export const getShopItems = async (query?: { wear: string }) => {
  const res = await client.shop.$get({ query });

  if (res.ok) {
    return res.json();
  }

  throw new Error(await res.text());
};
