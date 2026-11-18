import config from '@/arena/config';

// Nested groups are executed sequentially, left to right, by EngineService.
export const actionStages = config.stages.flat();
const stageRanks = new Map<string, number>(actionStages.map((action, rank) => [action, rank]));

export function getStageRank(action: string): number {
  // Unscheduled actions share the last rank and retain their insertion order.
  return stageRanks.get(action) ?? actionStages.length;
}
