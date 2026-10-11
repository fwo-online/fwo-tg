import { describe, expect, it, spyOn } from 'bun:test';
import { type BranchKey, CharacterClass } from '@fwo/shared';
import { CharacterService } from '@/arena/CharacterService/CharacterService';
import MagicService from '@/arena/MagicService';
import { CharModel } from '@/models/character';
import { registerGlobals } from '@/utils/registerGlobals';

registerGlobals();

const createCharacter = (secondProf?: CharacterClass) =>
  new CharacterService(
    new CharModel({ owner: '123', nickname: 'Branch test', prof: CharacterClass.Mage, secondProf }),
    true,
  );

describe('character branch contract', () => {
  it('rejects invalid complete branch arrays before mutating or saving', async () => {
    const character = createCharacter(CharacterClass.Priest);
    character.charObj.branches = ['elements'];
    const saved = spyOn(character, 'saveToDb');
    const invalid: BranchKey[][] = [
      ['unknown' as BranchKey],
      ['elements', 'elements'],
      ['elements', 'holy', 'arcana'],
      ['guardian'],
      ['elements', 'holy'], // second slot requires level 10
    ];
    for (const branches of invalid) {
      await expect(character.setBranches(branches)).rejects.toMatchObject({
        name: 'ValidationError',
      });
      expect(character.branches).toEqual(['elements']);
    }
    expect(saved).not.toHaveBeenCalled();
    saved.mockRestore();
  });

  it('allows both classes at level 10 and retains a defensive copy', async () => {
    const character = createCharacter(CharacterClass.Priest);
    character.charObj.exp = 10000000;
    const saved = spyOn(character, 'saveToDb').mockResolvedValue(undefined);
    const branches: BranchKey[] = ['elements', 'holy'];
    await character.setBranches(branches);
    branches.push('arcana');
    expect(character.branches).toEqual(['elements', 'holy']);
    saved.mockRestore();
  });

  it('propagates a Mongoose update failure and restores the cached branches', async () => {
    const character = createCharacter();
    character.isBot = false;
    character.charObj.branches = ['elements'];
    const failure = new Error('db unavailable');
    const update = spyOn(CharModel, 'findByIdAndUpdate').mockImplementation((() => ({
      orFail: async () => {
        throw failure;
      },
    })) as unknown as typeof CharModel.findByIdAndUpdate);
    const log = spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(character.setBranches(['darkness'])).rejects.toBe(failure);
      expect(character.branches).toEqual(['elements']);
      expect(character.toObject().branches).toEqual(['elements']);
      expect(update).toHaveBeenCalledTimes(1);
    } finally {
      update.mockRestore();
      log.mockRestore();
    }
  });

  it('does not report a successful branch selection when Mongoose rejects the update', async () => {
    const character = createCharacter();
    character.isBot = false;
    const failure = new Error('db unavailable');
    const update = spyOn(CharModel, 'findByIdAndUpdate').mockImplementation((() => ({
      orFail: async () => {
        throw failure;
      },
    })) as unknown as typeof CharModel.findByIdAndUpdate);
    const log = spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(MagicService.selectBranch(character, 'elements')).rejects.toBe(failure);
      expect(character.branches).toEqual([]);
      expect(character.toPublicObject().branches).toEqual([]);
    } finally {
      update.mockRestore();
      log.mockRestore();
    }
  });

  it('validates newly created documents while preserving empty defaults', async () => {
    await expect(
      new CharModel({ owner: '123', nickname: 'Bot', prof: CharacterClass.Warrior }).validate(),
    ).resolves.toBeUndefined();
    for (const branches of [
      ['elements', 'elements'],
      ['elements', 'darkness'],
      ['guardian'],
      ['unknown'],
      ['elements', 'darkness', 'arcana'],
    ]) {
      const invalid = new CharModel({
        owner: '123',
        nickname: 'Invalid',
        prof: CharacterClass.Mage,
        branches,
      });
      await expect(invalid.validate()).rejects.toThrow();
    }
    const hybrid = new CharModel({
      owner: '123',
      nickname: 'Hybrid',
      prof: CharacterClass.Mage,
      secondProf: CharacterClass.Priest,
      exp: 10000000,
      branches: ['elements', 'holy'],
    });
    await expect(hybrid.validate()).resolves.toBeUndefined();
  });

  it('starts new characters with empty canonical branches and no legacy magicBranches', () => {
    const character = createCharacter();
    expect(character.branches).toEqual([]);
    expect(character.charObj.branches).toEqual([]);
    expect(
      (character.charObj as unknown as { toObject: () => object }).toObject(),
    ).not.toHaveProperty('magicBranches');
    expect(character.toObject().branches).toEqual([]);
    expect(character.toObject()).not.toHaveProperty('magicBranches');
  });

  it('exposes unique primary and secondary classes in domain and DTOs', () => {
    const mage = createCharacter(CharacterClass.Priest);
    expect(mage.classes).toEqual([CharacterClass.Mage, CharacterClass.Priest]);
    expect(mage.toObject().secondProf).toBe(CharacterClass.Priest);
    expect(mage.toPublicObject().secondProf).toBe(CharacterClass.Priest);
    expect(mage.toPublicObject().branches).toEqual([]);

    const duplicate = createCharacter(CharacterClass.Mage);
    expect(duplicate.classes).toEqual([CharacterClass.Mage]);
    expect(createCharacter().classes).toEqual([CharacterClass.Mage]);
  });

  it('ignores legacy magicBranches rather than migrating them', () => {
    const character = createCharacter();
    (character.charObj as unknown as { magicBranches: string[] }).magicBranches = ['darkness'];
    expect(character.branches).toEqual([]);
    expect(character.toObject().branches).toEqual([]);
    expect(character.toPublicObject().branches).toEqual([]);
    expect(character).not.toHaveProperty('magicBranches');
    expect(character).not.toHaveProperty('resetMagics');
  });

  it('writes canonical branches and secondProf in the character persistence payload', async () => {
    const character = createCharacter(CharacterClass.Priest);
    character.isBot = false;
    character.charObj.branches = ['holy'];
    const update = spyOn(CharModel, 'findByIdAndUpdate').mockImplementation((() => ({
      orFail: async () => character.charObj,
    })) as typeof CharModel.findByIdAndUpdate);
    try {
      await character.saveToDb();
      const payload = update.mock.calls[0]?.[1];
      expect(payload?.branches).toEqual(['holy']);
      expect(payload?.secondProf).toBe(CharacterClass.Priest);
      expect(payload).not.toHaveProperty('magicBranches');
    } finally {
      update.mockRestore();
    }
  });
});
