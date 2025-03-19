import { client, createRequest } from '@/api';

export const getAvailableSkillList = async () => {
  return createRequest(client.skill.available.$get)({});
};

export const getSkillsList = async (ids: string[]) => {
  return createRequest(client.skill.$get)({ query: { ids } });
};

export const getSkill = async (id: string) => {
  return createRequest(client.skill[':id'].$get)({ param: { id } });
};

export const learnSkill = async (id: string) => {
  return createRequest(client.skill[':id'].$post)({ param: { id } });
};
