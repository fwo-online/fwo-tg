import type { Magic } from '@/arena/Constuructors/MagicConstructor';
import { bold } from '@/utils/formatString';
import { getDamageTypeIcon } from '@/utils/icons';

const getOrderType = (magic: Magic) => {
  switch (magic.orderType) {
    case 'all':
    case 'any':
      return 'На любого';
    case 'enemy':
      return 'На врага';
    case 'self':
      return 'На себя';
    case 'team':
      return 'На команду';
    case 'teamExceptSelf':
      return 'На команду (кроме себя)';
    default:
      return magic.orderType;
  }
};

const getAoeType = (magic: Magic) => {
  switch (magic.aoeType) {
    case 'target':
      return 'эффект по одной цели';
    case 'targetAoe':
      return 'распространяющийся эффект';
    case 'team':
      return 'массовый эффект';
    default:
      return magic.actionType;
  }
};

const getType = (magic: Magic) => {
  switch (magic.magType) {
    case 'bad':
      return 'Отрицательная';
    case 'good':
      return 'Положительная';
    default:
      return magic.magType;
  }
};

export const getMagicDescription = (magic: Magic, currentLvl?: number) => {
  return `
${bold(magic.displayName)}
${magic.desc}

Круг магии: ${magic.lvl}
Стоимость: ${magic.costType === 'mp' ? '💧' : '🔋'}${magic.cost}
Базовый опыт: ${magic.baseExp}
Тип: ${getType(magic)}
Тип заказа: ${getOrderType(magic)}, ${getAoeType(magic)}
Шанс: ${magic.chance.map((chance, i) => (i + 1 === currentLvl ? bold(chance) : chance)).join('/')}
Эффект: ${magic.effect.map((effect, i) => (i + 1 === currentLvl ? bold(effect) : effect)).join('/')}
Тип эффекта: ${getDamageTypeIcon(magic.effectType) || '❎'}
Длительная: ${magic.isLong ? '✅' : '❎'}
`;
};
