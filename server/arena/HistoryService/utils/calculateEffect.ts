import type { SuccessArgs } from '@/arena/Constuructors/types';
import { floatNumber } from '@/utils/floatNumber';

export const calculateEffect = (item: SuccessArgs) => {
  if (item.expArr.length) {
    return item.expArr.reduce((effect, { val }) => {
      return floatNumber(effect + (val || 0));
    }, item.effect);
  }

  return item.effect;
};
