import { ForestEventType } from '@fwo/shared';
import { pickByWeight, type Weighted } from '@/utils/pickByWeight';

const events: Weighted<ForestEventType>[] = [
  { value: ForestEventType.Wolf, weight: 20 },
  // { value: ForestEventType.FallenTree, weight: 20 },
  { value: ForestEventType.Chest, weight: 20 },
  { value: ForestEventType.Campfire, weight: 15 },
  // { value: ForestEventType.AbandonedCamp, weight: 15 },
  { value: ForestEventType.OldTrap, weight: 15 },
  { value: ForestEventType.AbandonedSword, weight: 10 },
  { value: ForestEventType.GlowingCrystal, weight: 5 },
];
export const getRandomEvent = (): ForestEventType => pickByWeight(events);
