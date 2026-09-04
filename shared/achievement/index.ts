import type { ItemComponent } from '@/item';

export type AchievementCategory = 'combat' | 'exploration' | 'tower' | 'craft' | 'boss' | 'mastery';

export type AchievementStatKey =
  | 'wins'
  | 'damage'
  | 'heal'
  | 'kills'
  | 'forestEvents'
  | 'towerFloors'
  | 'itemsCrafted'
  | 'bossDamage'
  | 'lvl';

export interface AchievementReward {
  exp?: number;
  gold?: number;
  components?: Partial<Record<ItemComponent, number>>;
  titleReward?: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  stat: AchievementStatKey;
  goal: number;
  reward: AchievementReward;
  icon?: string;
}

export interface AchievementPublic {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  stat: AchievementStatKey;
  goal: number;
  maxProgress: number; // Для обратной совместимости с UI
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: AchievementReward;
  icon?: string;
}
