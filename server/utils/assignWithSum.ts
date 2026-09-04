import { isNil } from 'es-toolkit';
import { assignWith, isObject } from 'es-toolkit/compat';

const sum = (a, b) => {
  if (isObject(b)) {
    return assignWith(a, b, sum);
  }
  if (isNil(a)) {
    return +b;
  }
  return +a + +b;
};

export const assignWithSum = (a, b) => assignWith(a, b, sum);
