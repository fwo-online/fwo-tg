import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { ForestEventAction, ForestEventType, ForestState } from '@fwo/shared';
import arena from '@/arena';
import TestUtils from '@/utils/testUtils';
import { ForestService } from './ForestService';

describe('ForestService', () => {
  beforeEach(() => {
    TestUtils.mockRandom();
  });

  afterEach(() => {
    TestUtils.restoreRandom();
  });

  describe('createForest', () => {
    it('should create forest for character', async () => {
      const { forestService, character } = await TestUtils.createForest();

      expect(forestService).toBeInstanceOf(ForestService);
      expect(character.forestID).toBe(forestService.id);
      expect(arena.forests[forestService.id]).toBe(forestService);
    });
  });

  describe('events', () => {
    describe('wolf event', () => {
      it('should handle PassBy action', async () => {
        TestUtils.mockRandom(0.1);
        const { forestService } = await TestUtils.createForest();

        await forestService.createEvent(ForestEventType.Wolf);

        const result = await forestService.handleEventAction(ForestEventAction.Sneak);

        expect(result.success).toBe(true);
        expect(result.message).toContain('прокрался');
      });

      it('should handle Sneak action - success', async () => {
        const { forestService } = await TestUtils.createForest({
          harks: { str: 10, dex: 100, wis: 10, int: 10, con: 10 },
        });

        await forestService.createEvent(ForestEventType.Wolf);

        // Mock high roll for success
        TestUtils.mockRandom(0.1);
        const result = await forestService.handleEventAction(ForestEventAction.Sneak);

        expect(result.success).toBe(true);
        expect(result.message).toContain('прокрался');
      });

      it.skip('should handle Sneak action - fail triggers battle', async () => {
        const { forestService } = await TestUtils.createForest({
          harks: { str: 10, dex: 1, wis: 10, int: 10, con: 10 },
        });

        // Mock startBattle to avoid game creation
        spyOn(forestService, 'startBattle').mockImplementation(() => Promise.resolve());

        await forestService.createEvent(ForestEventType.Wolf);

        // Mock low dex, high roll for failure
        TestUtils.mockRandom(0.99);
        const result = await forestService.handleEventAction(ForestEventAction.Sneak);

        expect(result.success).toBe(false);
      });

      // it.skip('should handle AttackWolf action', async () => {
      //   const { forestService } = await TestUtils.createForest();

      //   // Mock startBattle to avoid game creation
      //   spyOn(forestService, 'startBattle').mockImplementation(() => Promise.resolve());

      //   await forestService.createEvent(ForestEventType.Wolf);

      //   const result = await forestService.handleEventAction(ForestEventAction.AttackWolf);

      //   expect(result.success).toBe(true);
      // });
    });

    describe('campfire event', () => {
      it('should handle PassBy action', async () => {
        const { forestService } = await TestUtils.createForest();

        await forestService.createEvent(ForestEventType.Campfire);

        const result = await forestService.handleEventAction(ForestEventAction.PassBy);

        expect(result.success).toBe(true);
        expect(result.message).toContain('прошёл мимо');
      });

      it('should handle Rest action and heal player', async () => {
        const { forestService } = await TestUtils.createForest();

        const baseHp = forestService.player.stats.val('base.hp');
        // Reduce player HP to half of base HP
        const reducedHp = Math.floor(baseHp / 2);
        forestService.player.stats.set('hp', reducedHp);

        await forestService.createEvent(ForestEventType.Campfire);

        const result = await forestService.handleEventAction(ForestEventAction.Rest);

        expect(result.success).toBe(true);
        expect(result.reward?.hp).toBeGreaterThan(0);
        expect(result.reward?.hp).toBeLessThanOrEqual(Math.floor(baseHp * 0.5));
      });
    });

    describe('chest event', () => {
      it('should handle PassBy action', async () => {
        const { forestService } = await TestUtils.createForest();

        await forestService.createEvent(ForestEventType.Chest);

        const result = await forestService.handleEventAction(ForestEventAction.PassBy);

        expect(result.success).toBe(true);
        expect(result.message).toContain('прошёл мимо');
      });

      it('should handle OpenChest action and give gold', async () => {
        const { forestService } = await TestUtils.createForest();

        await forestService.createEvent(ForestEventType.Chest);

        // Mock random > 0.1 to avoid enemy spawn
        TestUtils.mockRandom(0.5);
        const result = await forestService.handleEventAction(ForestEventAction.OpenChest);

        expect(result.success).toBe(true);
        expect(result.reward?.gold).toBeGreaterThan(0);
      });
    });
  });

  describe('event timeout', () => {
    it('should handle event timeout by passing by', async () => {
      const { forestService } = await TestUtils.createForest();

      await forestService.createEvent(ForestEventType.Wolf);

      // @ts-expect-error - accessing private property for testing
      forestService.currentEvent.expiresAt = new Date(Date.now() - 1000);

      await forestService.handleEventTimeout();

      expect(forestService.forest.state).toBe(ForestState.Waiting);
      expect(forestService.currentEvent).toBeUndefined();
    });
  });

  describe('endForest', () => {
    it('should start escaping', async () => {
      const { forestService } = await TestUtils.createForest();

      await forestService.exitForest();

      expect(forestService.escaping).toBe(true);
    });

    it('should block forest on death', async () => {
      const { forestService, character } = await TestUtils.createForest();

      await forestService.endForest('death');

      expect(character.forestID).toBe('');
      expect(character.getPenaltyDate('forest_death')).toBeDate();
    });
  });

  describe('getAvailableActions', () => {
    it('should return correct actions for wolf event', async () => {
      const { forestService } = await TestUtils.createForest();

      await forestService.createEvent(ForestEventType.Wolf);

      const actions = forestService.getStatus().currentEvent?.availableActions;
      expect(actions).toContain(ForestEventAction.Sneak);
      expect(actions).toContain(ForestEventAction.AttackWolf);
    });

    it('should return correct actions for campfire event', async () => {
      const { forestService } = await TestUtils.createForest();

      await forestService.createEvent(ForestEventType.Campfire);

      const actions = forestService.getStatus().currentEvent?.availableActions;
      expect(actions).toContain(ForestEventAction.Rest);
    });

    it('should return correct actions for chest event', async () => {
      const { forestService } = await TestUtils.createForest();

      await forestService.createEvent(ForestEventType.Chest);

      const actions = forestService.getStatus().currentEvent?.availableActions;
      expect(actions).toContain(ForestEventAction.PassBy);
      expect(actions).toContain(ForestEventAction.OpenChest);
    });
  });

  describe('static methods', () => {
    it('isPlayerInForest should return true for player in forest', async () => {
      const { char } = await TestUtils.createForest();

      expect(ForestService.isPlayerInForest(char.id)).toBe(true);
    });

    it('isPlayerInForest should return false for player not in forest', async () => {
      const char = await TestUtils.createCharacter();

      expect(ForestService.isPlayerInForest(char.id)).toBe(false);
    });
  });
});
