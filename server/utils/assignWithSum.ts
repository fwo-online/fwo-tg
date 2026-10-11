import { isNil } from 'es-toolkit';
import { assignWith, isObject } from 'es-toolkit/compat';

const sum = (a: unknown, b: unknown): unknown => {
  if (isObject(b)) {
    return assignWith(a, b, sum);
  }
  if (isNil(a)) {
    return +(b as number);
  }
  return +(a as number) + +(b as number);
};

export const assignWithSum = <T extends object, U extends object>(a: T, b: U): T & U =>
  assignWith(a, b, sum) as T & U;
