export const wearList = [
  'head',
  'neck',
  'body',
  'hands',
  'leggings',
  'shoes',
  'rightHand',
  'leftHand',
  'twoHand',
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
  twoHand: 'Две руки',
};
