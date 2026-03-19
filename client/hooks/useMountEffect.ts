import { type EffectCallback, useEffect } from 'react';

export const useMountEffect = (func: EffectCallback) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  return useEffect(func, []);
};
