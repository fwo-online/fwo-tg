import { client, createRequest } from '@/api';

export const createClan = (name: string) => createRequest(client.clan.$post)({ json: { name } });
export const getClans = () => createRequest(client.clan.$get)({});
