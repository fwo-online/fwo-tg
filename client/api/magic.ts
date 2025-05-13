import { client, createRequest } from '@/api';

export const getAvailableMagicLevels = () => {
  return createRequest(client.magic.available.$get)({});
};

export const getMagicList = async (ids: string[]) => {
  return createRequest(client.magic.$get)({ query: { ids } });
};

export const getMagic = async (id: string) => {
  return createRequest(client.magic[':id'].$get)({ param: { id } });
};

export const learnMagic = async (lvl: number) => {
  return createRequest(client.magic[':lvl'].$post)({ param: { lvl: lvl.toString() } });
};
