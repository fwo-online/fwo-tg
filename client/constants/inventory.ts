export const wearList = [
  'head',
  'neck',
  'body',
  'hands',
  'leggings',
  'shoes',
  'rightHand',
  'leftHand',
] as const;

export const wearListTranslations: Record<(typeof wearList)[number], string> = {
  head: 'Голова',
  neck: 'Шея',
  body: 'Тело',
  hands: 'Руки',
  leggings: 'Ноги',
  shoes: 'Обувь',
  rightHand: 'Правая рука',
  leftHand: 'Левая рука',
};
