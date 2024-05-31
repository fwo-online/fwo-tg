import type { DamageType } from '../arena/Constuructors/types';

export const damageType: Record<DamageType, string> = {
  acid: '☣',
  fire: '🔥',
  frost: '❄️',
  lighting: '⚡',
  physical: '💥',
  clear: '⬜ ',
};

export const getDamageTypeIcon = (type?: DamageType) => {
  return type ? damageType[type] : '';
};
