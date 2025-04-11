import { client, createRequest } from '@/api';

export const getLadderList = () => createRequest(client.ladder.$get)({});
