import { ForestEventType } from '@fwo/shared';
import type { CharacterService } from '@/arena/CharacterService';
import { CampEvent } from '@/arena/ForestService/events/CampEvent';
import { ChestEvent } from '@/arena/ForestService/events/ChestEvent';
import { DeerEvent } from '@/arena/ForestService/events/DeerEvent';
import { TreeEvent } from '@/arena/ForestService/events/TreeEvent';
import { WolfEvent } from '@/arena/ForestService/events/WolfEvent';
import { getRandomItemByWeight } from '@/utils/getRandomItemByWeight';

const eventWeigths = [
  { event: ForestEventType.Camp, weight: 10 },
  { event: ForestEventType.Chest, weight: 5 },
  { event: ForestEventType.Deer, weight: 10 },
  { event: ForestEventType.Tree, weight: 10 },
  // { event: ForestEventType.Wolf, weight: 5 },
];

const eventMap = {
  [ForestEventType.Camp]: CampEvent,
  [ForestEventType.Chest]: ChestEvent,
  [ForestEventType.Deer]: DeerEvent,
  [ForestEventType.Tree]: TreeEvent,
  [ForestEventType.Wolf]: WolfEvent,
};

export function getRandomEvent(character: CharacterService) {
  const result = getRandomItemByWeight(eventWeigths, ({ weight }) => weight);

  if (!result) {
    return;
  }

  const Event = eventMap[result.event];

  return new Event(character);
}
