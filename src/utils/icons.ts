import type { DamageType } from '../arena/Constuructors/types';

type GetIcon = (str?: string | number) => string;

export const damageType: Record<DamageType, GetIcon> = {
  acid: (str) => `☣${str ?? ''}`,
  fire: (str) => `🔥${str ?? ''}`,
  frost: (str) => `❄️${str ?? ''}`,
  lighting: (str) => `⚡${str ?? ''}`,
  physical: (str) => `👊${str ?? ''}`,
  clear: (str) => `${str ?? ''}`,
};
