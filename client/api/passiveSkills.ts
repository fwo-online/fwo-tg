import { client, createRequest } from '@/api';

export const getPassiveSkillsList = async (ids: string[] = []) => {
  return createRequest(client.passiveSkill.$get)({ query: { ids } });
};

export const getPassiveSkill = async (id: string) => {
  return createRequest(client.passiveSkill[':id'].$get)({ param: { id } });
};

export const learnPassiveSkill = async (id: string) => {
  return createRequest(client.passiveSkill[':id'].$post)({ param: { id } });
};
