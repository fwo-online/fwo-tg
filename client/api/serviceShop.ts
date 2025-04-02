import { client, createRequest } from '@/api';

export const resetAttributes = () =>
  createRequest(client.serviceShop['reset-attributes'].$post)({});

export const getResetAttributesInvoice = () =>
  createRequest(client.serviceShop['reset-attributes'].invoice.$post)({});

export const changeName = (name: string) =>
  createRequest(client.serviceShop['change-name'].$post)({ json: { name } });

export const getChangeNameInvoice = (name: string) =>
  createRequest(client.serviceShop['change-name'].invoice.$post)({ json: { name } });

export const getDonationInvoice = (amount: number) =>
  createRequest(client.serviceShop.donate.invoice.$post)({ json: { amount } });
