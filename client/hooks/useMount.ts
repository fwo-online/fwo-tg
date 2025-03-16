import { type EffectCallback, useEffect, useRef } from 'react';

export const useMount = (func: EffectCallback) => {
  const funcRef = useRef(func);

  funcRef.current = func;

  return useEffect(() => funcRef.current(), []);
};
