import { ForestEventType, ForestPhase } from '@fwo/shared';
import { pickByWeight, type Weighted } from '@/utils/pickByWeight';

const eventsByPhase: Record<ForestPhase, Weighted<ForestEventType>[]> = {
  [ForestPhase.Edge]: [
    { value: ForestEventType.Chest, weight: 20 },
    { value: ForestEventType.Campfire, weight: 10 },
    { value: ForestEventType.OldTrap, weight: 20 },
    { value: ForestEventType.AbandonedSword, weight: 5 },
    { value: ForestEventType.FallenTree, weight: 10 },
    { value: ForestEventType.AbandonedCamp, weight: 10 },
  ],
  [ForestPhase.Wilds]: [
    { value: ForestEventType.FallenTree, weight: 5 },
    { value: ForestEventType.AbandonedCamp, weight: 5 },
    { value: ForestEventType.Wolf, weight: 20 },
    { value: ForestEventType.Chest, weight: 10 },
    { value: ForestEventType.Campfire, weight: 10 },
    { value: ForestEventType.OldTrap, weight: 10 },
    { value: ForestEventType.AbandonedSword, weight: 10 },
    { value: ForestEventType.GlowingCrystal, weight: 2 },
  ],
  [ForestPhase.Deep]: [
    { value: ForestEventType.Wolf, weight: 15 },
    { value: ForestEventType.Chest, weight: 5 },
    { value: ForestEventType.Campfire, weight: 5 },
    { value: ForestEventType.OldTrap, weight: 10 },
    { value: ForestEventType.AbandonedSword, weight: 10 },
    { value: ForestEventType.GlowingCrystal, weight: 5 },
  ],
};

export const getRandomEvent = (phase: ForestPhase): ForestEventType => {
  return pickByWeight(eventsByPhase[phase]);
};
