import { describe, expect, it } from 'bun:test';
import { CharacterClass, ContractTier, ContractType, ForestPhase } from '@fwo/shared';
import { CharacterService } from '@/arena/CharacterService';
import { ContractService } from '@/arena/ContractService/ContractService';
import TestUtils from '@/utils/testUtils';

describe('ContractService', () => {
  describe('getAvailableTypes', () => {
    it('returns Damage and Kills for all classes', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).toContain(ContractType.Damage);
      expect(types).toContain(ContractType.Kills);
    });

    it('adds Heal for Mage', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Mage });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).toContain(ContractType.Heal);
    });

    it('adds Heal for Priest', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Priest });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).toContain(ContractType.Heal);
    });

    it('does NOT add Heal for Warrior', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).not.toContain(ContractType.Heal);
    });

    it('does NOT add Heal for Archer', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Archer });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).not.toContain(ContractType.Heal);
    });

    it('adds UseAbility when character has magics', async () => {
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Mage,
        magics: { fireBall: 1 },
      });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).toContain(ContractType.UseAbility);
    });

    it('adds UseAbility when character has skills', async () => {
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Warrior,
        skills: { dodge: 1 },
      });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).toContain(ContractType.UseAbility);
    });

    it('does NOT add UseAbility when character has no magics or skills', async () => {
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Warrior,
        magics: {},
        skills: {},
      });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).not.toContain(ContractType.UseAbility);
    });

    it('adds ForestLocations for lvl ≤ 3', async () => {
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Warrior,
        exp: 500, // lvl 1
      });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).toContain(ContractType.ForestLocations);
    });

    it('does NOT add ForestLocations for lvl 9+', async () => {
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Warrior,
        exp: 1_000_000, // высокий уровень
      });
      const character = await CharacterService.getCharacterById(char.id);
      const types = ContractService.getAvailableTypes(character);
      expect(types).not.toContain(ContractType.ForestLocations);
    });
  });

  describe('getForestPhase', () => {
    it('returns Edge for lvl 1-4', () => {
      expect(ContractService.getForestPhase(1)).toBe(ForestPhase.Edge);
      expect(ContractService.getForestPhase(3)).toBe(ForestPhase.Edge);
      expect(ContractService.getForestPhase(4)).toBe(ForestPhase.Edge);
    });

    it('returns Wilds for lvl 5-8', () => {
      expect(ContractService.getForestPhase(5)).toBe(ForestPhase.Wilds);
      expect(ContractService.getForestPhase(6)).toBe(ForestPhase.Wilds);
      expect(ContractService.getForestPhase(8)).toBe(ForestPhase.Wilds);
    });

    it('returns Deep for lvl 9+', () => {
      expect(ContractService.getForestPhase(9)).toBe(ForestPhase.Deep);
      expect(ContractService.getForestPhase(15)).toBe(ForestPhase.Deep);
    });
  });

  describe('getForestPhaseName', () => {
    it('returns russian names', () => {
      expect(ContractService.getForestPhaseName(ForestPhase.Edge)).toBe('Опушке');
      expect(ContractService.getForestPhaseName(ForestPhase.Wilds)).toBe('Чаще');
      expect(ContractService.getForestPhaseName(ForestPhase.Deep)).toBe('Глуши');
    });
  });

  describe('calculateGoal', () => {
    it('Damage: lvl * 50 * tier', () => {
      expect(ContractService.calculateGoal(ContractType.Damage, 5, ContractTier.EASY)).toBe(250);
      expect(ContractService.calculateGoal(ContractType.Damage, 5, ContractTier.MEDIUM)).toBe(500);
      expect(ContractService.calculateGoal(ContractType.Damage, 5, ContractTier.HARD)).toBe(750);
    });

    it('Kills: max(1, floor(lvl/3) * tier)', () => {
      expect(ContractService.calculateGoal(ContractType.Kills, 1, ContractTier.EASY)).toBe(1);
      expect(ContractService.calculateGoal(ContractType.Kills, 3, ContractTier.EASY)).toBe(1);
      expect(ContractService.calculateGoal(ContractType.Kills, 6, ContractTier.EASY)).toBe(2);
      expect(ContractService.calculateGoal(ContractType.Kills, 6, ContractTier.MEDIUM)).toBe(4);
      expect(ContractService.calculateGoal(ContractType.Kills, 9, ContractTier.HARD)).toBe(9);
    });

    it('Heal: lvl * 40 * tier', () => {
      expect(ContractService.calculateGoal(ContractType.Heal, 5, ContractTier.EASY)).toBe(200);
      expect(ContractService.calculateGoal(ContractType.Heal, 5, ContractTier.MEDIUM)).toBe(400);
      expect(ContractService.calculateGoal(ContractType.Heal, 5, ContractTier.HARD)).toBe(600);
    });

    it('UseAbility: 3 + tier', () => {
      expect(ContractService.calculateGoal(ContractType.UseAbility, 99, ContractTier.EASY)).toBe(4);
      expect(ContractService.calculateGoal(ContractType.UseAbility, 99, ContractTier.MEDIUM)).toBe(
        5,
      );
      expect(ContractService.calculateGoal(ContractType.UseAbility, 99, ContractTier.HARD)).toBe(6);
    });

    it('ForestLocations: 2 + tier', () => {
      expect(
        ContractService.calculateGoal(ContractType.ForestLocations, 1, ContractTier.EASY),
      ).toBe(3);
      expect(
        ContractService.calculateGoal(ContractType.ForestLocations, 1, ContractTier.MEDIUM),
      ).toBe(4);
      expect(
        ContractService.calculateGoal(ContractType.ForestLocations, 1, ContractTier.HARD),
      ).toBe(5);
    });
  });

  describe('calculateReward', () => {
    it('exp = lvl * 250 * tier', () => {
      const easy = ContractService.calculateReward(5, ContractTier.EASY);
      expect(easy.exp).toBe(1250); // 5 * 250 * 1

      const medium = ContractService.calculateReward(5, ContractTier.MEDIUM);
      expect(medium.exp).toBe(2500); // 5 * 250 * 2

      const hard = ContractService.calculateReward(5, ContractTier.HARD);
      expect(hard.exp).toBe(3750); // 5 * 250 * 3
    });

    it('gold = lvl * 10 * tier', () => {
      const easy = ContractService.calculateReward(5, ContractTier.EASY);
      expect(easy.gold).toBe(50);

      const hard = ContractService.calculateReward(5, ContractTier.HARD);
      expect(hard.gold).toBe(150);
    });

    it('no components on tier 1 (EASY)', () => {
      const reward = ContractService.calculateReward(5, ContractTier.EASY);
      expect(reward.components).toEqual({});
    });

    it('components on tier >= 2 — low level (fabric + wood)', () => {
      const reward = ContractService.calculateReward(3, ContractTier.MEDIUM);
      expect(reward.components).toEqual({ fabric: 1, wood: 1 });
    });

    it('components on tier >= 3 — low level (fabric + wood ×2)', () => {
      const reward = ContractService.calculateReward(2, ContractTier.HARD);
      expect(reward.components).toEqual({ fabric: 2, wood: 2 });
    });

    it('components on mid level (leather + iron)', () => {
      const reward = ContractService.calculateReward(5, ContractTier.MEDIUM);
      expect(reward.components).toEqual({ leather: 1, iron: 1 });
    });

    it('components on high level (steel + arcanite)', () => {
      const reward = ContractService.calculateReward(9, ContractTier.MEDIUM);
      expect(reward.components).toEqual({ steel: 1, arcanite: 1 });
    });
  });

  describe('generateContracts', () => {
    it('always returns exactly 3 contracts', async () => {
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Mage,
        magics: { fireBall: 1 },
      });
      const character = await CharacterService.getCharacterById(char.id);
      const contracts = ContractService.generateContracts(character);
      expect(contracts).toHaveLength(3);
    });

    it('contracts have tiers 1, 2, 3 in order', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
      const character = await CharacterService.getCharacterById(char.id);
      const contracts = ContractService.generateContracts(character);
      expect(contracts[0].tier).toBe(ContractTier.EASY);
      expect(contracts[1].tier).toBe(ContractTier.MEDIUM);
      expect(contracts[2].tier).toBe(ContractTier.HARD);
    });

    it('each contract starts with progress 0 and not claimed', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
      const character = await CharacterService.getCharacterById(char.id);
      const contracts = ContractService.generateContracts(character);
      for (const c of contracts) {
        expect(c.progress).toBe(0);
        expect(c.claimed).toBe(false);
      }
    });

    it('each contract has positive goal, exp, gold', async () => {
      const char = await TestUtils.createCharacter({ prof: CharacterClass.Warrior });
      const character = await CharacterService.getCharacterById(char.id);
      const contracts = ContractService.generateContracts(character);
      for (const c of contracts) {
        expect(c.goal).toBeGreaterThan(0);
        expect(c.exp).toBeGreaterThan(0);
        expect(c.gold).toBeGreaterThan(0);
      }
    });

    it('fills missing types with Damage', async () => {
      // Warrior without magics/skills and lvl > 3 → only Damage, Kills
      // That's 2 types for 3 slots → 3rd should be Damage
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Warrior,
        magics: {},
        skills: {},
        exp: 1_000_000, // high level → no ForestLocations
      });
      const character = await CharacterService.getCharacterById(char.id);
      const contracts = ContractService.generateContracts(character);
      // Все 3 контракта должны быть Damage или Kills (2 уникальных типа + 1 дубликат)
      const types = contracts.map((c) => c.type);
      expect(
        types.filter((t) => t === ContractType.Damage || t === ContractType.Kills),
      ).toHaveLength(3);
    });

    it('goal increases with tier for the same type', async () => {
      const char = await TestUtils.createCharacter({
        prof: CharacterClass.Warrior,
        magics: {},
        skills: {},
        exp: 1_000_000,
      });
      const character = await CharacterService.getCharacterById(char.id);
      const contracts = ContractService.generateContracts(character);
      // Если один и тот же тип на разных тирах — goal растёт
      // Проверяем, что goal[tier=3] > goal[tier=1] если тип одинаковый
      for (let i = 0; i < contracts.length; i++) {
        for (let j = i + 1; j < contracts.length; j++) {
          if (contracts[i].type === contracts[j].type) {
            expect(contracts[j].goal).toBeGreaterThan(contracts[i].goal);
          }
        }
      }
    });
  });
});
