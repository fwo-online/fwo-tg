import { client, createRequest } from '@/client';

export const equipItem = async (id: string) => {
  return createRequest(client.inventory[':id'].equip.$patch)({ param: { id } });
};

export const unEquipItem = async (id: string) => {
  return createRequest(client.inventory[':id'].unequip.$patch)({ param: { id } });
};

export const sellItem = async (id: string) => {
  return createRequest(client.inventory[':id'].$delete)({ param: { id } });
};
