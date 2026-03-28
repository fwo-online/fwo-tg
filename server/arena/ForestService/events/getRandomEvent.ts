import { ForestEventType } from '@fwo/shared';
import { pickByWeight, type Weighted } from '@/utils/pickByWeight';
import { sumBy } from 'es-toolkit';

const events: Weighted<ForestEventType>[] = [
  { value: ForestEventType.Wolf, weight: 20 },
  // { value: ForestEventType.FallenTree, weight: 20 },
  { value: ForestEventType.Chest, weight: 20 },
  { value: ForestEventType.Campfire, weight: 15 },
  // { value: ForestEventType.AbandonedCamp, weight: 15 },
  { value: ForestEventType.OldTrap, weight: 10 },
  { value: ForestEventType.AbandonedSword, weight: 7 },
  { value: ForestEventType.GlowingCrystal, weight: 2 },
];

const avgWeight = sumBy(events, ({ weight }) => weight) / events.length;

export const getRandomEvent = (depth: number): ForestEventType => {
  const modifiedEvents: Weighted<ForestEventType>[] = events.map(({ value, weight }) => ({
    value,
    weight: weight * (1 + (avgWeight - weight * depth) / avgWeight),
  }));

  return pickByWeight(modifiedEvents);
};
