import { client, createRequest } from '@/api';

export const equipItem = async (id: string) => {
  return createRequest(client.inventory[':id'].equip.$patch)({ param: { id } });
};

export const unEquipItem = async (id: string) => {
  return createRequest(client.inventory[':id'].unequip.$patch)({ param: { id } });
};

export const forgeItem = async (code: string) => {
  return createRequest(client.inventory.forge[':code'].$post)({ param: { code } });
};
