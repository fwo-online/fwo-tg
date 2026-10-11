import { afterAll, describe, expect, it, spyOn } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import { sign } from '@tma.js/init-data-node';
import { CharacterService } from '@/arena/CharacterService/CharacterService';
import { CharModel } from '@/models/character';
import { magic } from '@/server/magic';
import { registerGlobals } from '@/utils/registerGlobals';

registerGlobals();

const previousToken = process.env.BOT_TOKEN;
process.env.BOT_TOKEN = '123456:branch-route-test';
const token = sign({ user: { id: 123, first_name: 'Tester' } }, process.env.BOT_TOKEN, new Date());
const authorization = { authorization: `tma ${token}` };

afterAll(() => {
  if (previousToken === undefined) delete process.env.BOT_TOKEN;
  else process.env.BOT_TOKEN = previousToken;
});

describe('GET /magic with authenticated character', () => {
  it('rejects unauthenticated requests', async () => {
    expect((await magic.request('/')).status).toBe(401);
  });

  it('lists second-class spells and shared spells once, without changing ids queries', async () => {
    const character = new CharacterService(
      new CharModel({
        owner: '123',
        nickname: 'Mage/Priest',
        prof: CharacterClass.Mage,
        secondProf: CharacterClass.Priest,
      }),
      true,
    );
    const lookup = spyOn(CharacterService, 'getCharacter').mockResolvedValue(character);
    try {
      const response = await magic.request('/', { headers: authorization });
      expect(response.status).toBe(200);
      const spells = (await response.json()) as { name: string }[];
      const names = spells.map((spell) => spell.name);
      expect(names).toContain('mediumHeal');
      expect(names).toContain('magicArrow');
      expect(names.filter((name) => name === 'lightHeal')).toHaveLength(1);
      expect(names).toHaveLength(new Set(names).size);
      expect(lookup).toHaveBeenCalledWith('123');

      const ids = await magic.request('/?ids=mediumHeal', { headers: authorization });
      expect(ids.status).toBe(200);
      expect(((await ids.json()) as { name: string }[]).map((spell) => spell.name)).toEqual([
        'mediumHeal',
      ]);
    } finally {
      lookup.mockRestore();
    }
  });
});
