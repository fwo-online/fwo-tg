import { type ForestEventAction, type ForestEventResult, ForestEventType } from '@fwo/shared';
import { handleAbandonedCampEvent } from '@/arena/ForestService/events/abadonedCamp';
import { handleAbandonedSwordEvent } from '@/arena/ForestService/events/abadonedSword';
import { handleCampfireEvent } from '@/arena/ForestService/events/campfire';
import { handleChestEvent } from '@/arena/ForestService/events/chest';
import { handleFallenTreeEvent } from '@/arena/ForestService/events/fallenTree';
import { handleGlowingCrystalEvent } from '@/arena/ForestService/events/glowingCrystal';
import { handleOldTrapEvent } from '@/arena/ForestService/events/oldTrap';
import { handleWolfEvent } from '@/arena/ForestService/events/wolf';
import type { ForestService } from '@/arena/ForestService/ForestService';
import { handleOtherPlayerEvent } from '@/arena/ForestService/events/otherPlayer';

export type ForestEventHandler = (
  action: ForestEventAction,
  forest: ForestService,
) => Promise<ForestEventResult>;

const eventHandlerByTypeMap: Record<ForestEventType, ForestEventHandler> = {
  [ForestEventType.Wolf]: handleWolfEvent,
  [ForestEventType.FallenTree]: handleFallenTreeEvent,
  [ForestEventType.Chest]: handleChestEvent,
  [ForestEventType.Campfire]: handleCampfireEvent,
  [ForestEventType.AbandonedCamp]: handleAbandonedCampEvent,
  [ForestEventType.OldTrap]: handleOldTrapEvent,
  [ForestEventType.AbandonedSword]: handleAbandonedSwordEvent,
  [ForestEventType.GlowingCrystal]: handleGlowingCrystalEvent,
  [ForestEventType.OtherPlayer]: handleOtherPlayerEvent,
};

export const getEventHandler = (eventType: ForestEventType) => eventHandlerByTypeMap[eventType];
