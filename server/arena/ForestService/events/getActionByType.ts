import { ForestEventAction, ForestEventType } from '@fwo/shared';

const actionsByTypeMap: Record<ForestEventType, ForestEventAction[]> = {
  [ForestEventType.Wolf]: [ForestEventAction.Sneak, ForestEventAction.AttackWolf],
  [ForestEventType.FallenTree]: [ForestEventAction.ChopTree, ForestEventAction.PassBy],
  [ForestEventType.Chest]: [ForestEventAction.OpenChest, ForestEventAction.PassBy],
  [ForestEventType.Campfire]: [ForestEventAction.Rest],
  [ForestEventType.AbandonedCamp]: [ForestEventAction.ScavengeCamp, ForestEventAction.PassBy],
  [ForestEventType.OldTrap]: [ForestEventAction.DisarmTrap, ForestEventAction.PassBy],
  [ForestEventType.AbandonedSword]: [ForestEventAction.TakeSword, ForestEventAction.PassBy],
  [ForestEventType.GlowingCrystal]: [ForestEventAction.TakeCrystal, ForestEventAction.PassBy],
};

export const getActionByType = (eventType: ForestEventType) => actionsByTypeMap[eventType];
