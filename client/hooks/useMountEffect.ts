import { type EffectCallback, useEffect } from 'react';

export const useMountEffect = (func: EffectCallback) => {
  return useEffect(func, []);
};
