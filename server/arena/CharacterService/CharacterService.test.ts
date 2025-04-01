import { describe, it, expect, beforeEach } from 'bun:test';
import casual from 'casual';
import TestUtils from '@/utils/testUtils';
import { CharacterService } from './CharacterService';
import { CharacterClass } from '@fwo/shared';
import { profsData } from '@/data/profs';

describe('CharacterService', () => {
  let character: CharacterService;

  beforeEach(async () => {
    casual.seed(1);

    const char = await TestUtils.createCharacter({
      prof: CharacterClass.Warrior,
      harks: { str: 20, dex: 20, wis: 20, int: 20, con: 20 },
    });
    character = await CharacterService.getCharacterById(char.id);
  });

  it('should add free correctly', async () => {
    await character.attributes.increaseAttributes({
      ...character.charObj.harks,
      str: character.charObj.harks.str + 2,
    });

    expect(character.resources.free).toEqual(8);
    await character.resources.addResources({ exp: 3000 });

    await character.attributes.increaseAttributes({
      ...character.charObj.harks,
      str: character.charObj.harks.str + 2,
    });
    expect(character.resources.free).toEqual(16);

    await character.resources.addResources({ exp: 6000 });

    expect(character.resources.free).toEqual(26);
  });

  it('should reset attributes', async () => {
    await character.attributes.resetAttributes({});

    expect(character.attributes.attributes).toMatchObject(profsData[character.class].hark);
  });
});
