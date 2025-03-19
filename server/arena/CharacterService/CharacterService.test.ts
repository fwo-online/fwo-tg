import {
  describe, beforeAll, it, expect,
} from 'bun:test';
import casual from 'casual';
import TestUtils from '@/utils/testUtils';
import { CharacterService } from './CharacterService';

describe('CharacterService', () => {
  let character: CharacterService;

  beforeAll(async () => {
    casual.seed(1);

    const char = await TestUtils.createCharacter();
    character = await CharacterService.getCharacterById(char.id)
  });


  it('should add free correctly', async () => {
    await character.increaseHarks({...character.charObj.harks, str: character.charObj.harks.str + 2})

    expect(character.free).toEqual(8)
    character.exp += 3000;
    
    await character.increaseHarks({...character.charObj.harks, str: character.charObj.harks.str + 2})
    expect(character.free).toEqual(16)

    character.exp += 6000;

    expect(character.free).toEqual(26)
  });

});
