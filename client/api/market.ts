import { client, createRequest } from '@/api';

export const getMarketItems = () => createRequest(client.market.$get)({});

export const createMarketItem = (itemID: string, price: number) =>
  createRequest(client.market.$post)({ json: { itemID, price } });

export const buyMarketItem = (id: string) =>
  createRequest(client.market[':id'].$post)({ param: { id } });

export const deleteMarketItem = (marketItemID: string) =>
  createRequest(client.market.$delete)({ json: { marketItemID } });
