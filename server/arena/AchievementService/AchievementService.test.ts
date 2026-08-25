import { beforeEach, describe, expect, it } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import arena from '@/arena';
import type { CharacterService } from '@/arena/CharacterService';
import TestUtils from '@/utils/testUtils';
import { ACHIEVEMENT_DEFINITIONS } from './AchievementDefinitions';
import { AchievementService } from './AchievementService';

describe('AchievementService (Stats-Based) & Vigor', () => {
  let char: CharacterService;

  beforeEach(async () => {
    TestUtils.resetCharacterCache();
    const charDoc = await TestUtils.createCharacter({
      prof: CharacterClass.Warrior,
      exp: 1000,
    });
    char = arena.characters[charDoc.id];
  });

  it('should list all achievements with initial zero progress', () => {
    const list = AchievementService.getAchievements(char);
    expect(list.length).toBe(ACHIEVEMENT_DEFINITIONS.length);
    const win10 = list.find((a) => a.id === 'arena_wins_10');
    expect(win10).toBeDefined();
    expect(win10?.progress).toBe(0);
    expect(win10?.completed).toBe(false);
    expect(win10?.claimed).toBe(false);
  });

  it('should derive progress directly from character statistics', async () => {
    await char.performance.addStat('wins', 5);
    let list = AchievementService.getAchievements(char);
    let win10 = list.find((a) => a.id === 'arena_wins_10');
    expect(win10?.progress).toBe(5);
    expect(win10?.completed).toBe(false);

    await char.performance.addStat('wins', 5);
    list = AchievementService.getAchievements(char);
    win10 = list.find((a) => a.id === 'arena_wins_10');
    expect(win10?.progress).toBe(10);
    expect(win10?.completed).toBe(true);
  });

  it('should claim reward, unlock title, and prevent double claiming', async () => {
    await char.performance.addStat('wins', 10);
    const initialGold = char.resources.gold;

    const reward = await AchievementService.claim(char, 'arena_wins_10');
    expect(reward.gold).toBe(50);
    expect(char.resources.gold).toBe(initialGold + 50);
    expect(char.unlockedTitles).toContain('Гладиатор');

    const list = AchievementService.getAchievements(char);
    const win10 = list.find((a) => a.id === 'arena_wins_10');
    expect(win10?.claimed).toBe(true);

    expect(AchievementService.claim(char, 'arena_wins_10')).rejects.toThrow();
  });

  it('should allow setting active title only from unlocked titles', async () => {
    await char.performance.addStat('wins', 10);
    await AchievementService.claim(char, 'arena_wins_10');
    expect(char.unlockedTitles).toContain('Гладиатор');

    await AchievementService.setActiveTitle(char, 'Гладиатор');
    expect(char.activeTitle).toBe('Гладиатор');

    // Title not unlocked should throw
    expect(AchievementService.setActiveTitle(char, 'Убийца Богов')).rejects.toThrow();

    // Clearing title
    await AchievementService.setActiveTitle(char, null);
    expect(char.activeTitle).toBeUndefined();
  });

  it('should apply vigor 2x bonus for active energy and deduct energy', async () => {
    // Initial energy = 100
    expect(char.vigor?.energy).toBe(100);

    const prevExp = char.resources.exp;
    await char.resources.addResources({ exp: 100 });

    // With vigor (2x boost), 100 exp becomes +200 exp
    expect(char.resources.exp).toBe(prevExp + 200);
    // 10 energy deducted
    expect(char.vigor?.energy).toBe(90);
  });

  it('should update statistics via CraftService event emission', async () => {
    const { CraftService } = await import('@/arena/CraftService/CraftService');
    CraftService.emitter.emit('craft', { character: char, item: {} as any });

    const list = AchievementService.getAchievements(char);
    const craft5 = list.find((a) => a.id === 'items_crafted_5');
    expect(craft5?.progress).toBe(1);
  });

  // it('should update statistics via ForestService event emission', async () => {
  //   const { ForestService } = await import('@/arena/ForestService/ForestService');
  //   ForestService.emitter.emit('end', {
  //     forest: {} as any,
  //     character: char,
  //     eventsCount: 3,
  //     win: true,
  //   });

  //   const list = AchievementService.getAchievements(char);
  //   const forest20 = list.find((a) => a.id === 'forest_events_20');
  //   expect(forest20?.progress).toBe(3);
  // });

  // it('should update statistics via TowerService event emission', async () => {
  //   const { TowerService } = await import('@/arena/TowerService/TowerService');
  //   TowerService.emitter.emit('end', {
  //     tower: {} as any,
  //     characters: [char],
  //     floor: 1,
  //     win: true,
  //   });

  //   const list = AchievementService.getAchievements(char);
  //   const tower5 = list.find((a) => a.id === 'tower_floors_5');
  //   expect(tower5?.progress).toBe(1);
  // });

  // it('should update statistics via WorldBossService event emission', async () => {
  //   const { WorldBossService } = await import('@/arena/WorldBossService/WorldBossService');
  //   WorldBossService.emitter.emit('attack', {
  //     character: char,
  //     damage: 1500,
  //   });

  //   const list = AchievementService.getAchievements(char);
  //   const boss50k = list.find((a) => a.id === 'boss_damage_50k');
  //   expect(boss50k?.progress).toBe(1500);
  // });
});
