import { mergeWith } from 'es-toolkit';

export const mergeNumbersWith = <T extends object, S extends object>(
  target: T,
  source: S,
  predicate: (targetValue: number, sourceValue: number) => number,
): T & S => {
  return mergeWith(target, source, (targetValue, sourceValue) => {
    if (typeof targetValue === 'number' && typeof sourceValue === 'number') {
      return predicate(targetValue, sourceValue);
    }
  });
};
