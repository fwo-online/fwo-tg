import { client, createRequest } from '@/client';
import type { CharacterAttributes, CreateCharacterDto } from '@fwo/schemas';
import { mapValues } from 'es-toolkit';

export const getCharacter = async () => {
  return createRequest(client.character.$get)({});
};

export const createCharacter = async (json: CreateCharacterDto) => {
  return createRequest(client.character.$post)({ json });
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

export const buyItem = async (code: string) => {
  return createRequest(client.inventory[':code'].$post)({ param: { code } });
};
