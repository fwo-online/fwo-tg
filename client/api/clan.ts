import { client, createRequest } from '@/api';

export const createClan = (name: string) => createRequest(client.clan.$post)({ json: { name } });

export const getClans = () => createRequest(client.clan.$get)({});

export const getClanByID = (id: string) =>
  createRequest(client.clan[':id'].$get)({ param: { id } });

export const createClanRequest = (id: string) =>
  createRequest(client.clan[':id']['create-request'].$post)({ param: { id } });

export const cancelClanRequest = (id: string) =>
  createRequest(client.clan[':id']['cancel-request'].$post)({ param: { id } });

export const addGold = (gold: number) =>
  createRequest(client.clan['add-gold'].$post)({ json: { gold } });

export const acceptClanRequest = (id: string) =>
  createRequest(client.clan.accept[':id'].$post)({ param: { id } });

export const rejectClanRequest = (id: string) =>
  createRequest(client.clan.reject[':id'].$post)({ param: { id } });

export const upgradeClanLvl = () => createRequest(client.clan['upgrade-lvl'].$post)({});

export const deleteClan = () => createRequest(client.clan.$delete)({});

export const leaveClan = () => createRequest(client.clan.leave.$post)({});
