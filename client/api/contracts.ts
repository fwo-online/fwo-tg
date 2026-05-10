import type { Contract } from '@fwo/shared';
import { client, createRequest } from '@/api';

export const getContracts = async (): Promise<Contract[]> => {
  return createRequest(client.contracts.$get)({});
};

export const claimContract = async (index: number) => {
  return createRequest(client.contracts[':idx'].claim.$post)({ param: { idx: index.toString() } });
};
