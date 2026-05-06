import type { CharacterAttributes, CreateCharacterDto, NotificationSettings } from '@fwo/shared';
import { mapValues } from 'es-toolkit';
import { client, createRequest } from '@/api';

export const getCharacter = async () => {
  const res = await client.character.$get();

  if (res.ok) {
    return res.json();
  }
};

export const getCharacterList = async (ids: string[]) =>
  createRequest(client.character.list.$get)({ query: { ids } });

export const createCharacter = async (json: CreateCharacterDto) => {
  return createRequest(client.character.$post)({ json });
};

export const getMyCharacters = async () => {
  return createRequest(client.character.my.$get)({});
};

export const activateCharacter = async (id: string) => {
  return createRequest(client.character[':id'].activate.$patch)({ param: { id } });
};

export const changeCharacterAttributes = async (json: CharacterAttributes) => {
  return createRequest(client.character.attributes.$patch)({ json });
};

export const deleteCharacter = async () => {
  return createRequest(client.character.$delete)({});
};

export const getCharacterDynamicAttributes = async (attributes: CharacterAttributes) => {
  return createRequest(client.character['dynamic-attributes'].$get)({
    query: mapValues(attributes, (n) => n.toString()),
  });
};

export const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
  return createRequest(client.character['notification-settings'].$patch)({ json: settings });
};
