import { EffectType } from '@fwo/shared';

export const damageType: Record<EffectType, string> = {
  [EffectType.Acid]: '☣',
  [EffectType.Fire]: '🔥',
  [EffectType.Frost]: '❄️',
  [EffectType.Lightning]: '⚡',
  [EffectType.Physical]: '💥',
  [EffectType.Clear]: '✨',
};

export const getDamageTypeIcon = (type?: EffectType) => {
  return type ? damageType[type] : '';
};
