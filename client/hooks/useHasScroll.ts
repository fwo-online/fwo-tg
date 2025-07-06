import { useState, useLayoutEffect, type RefObject } from 'react';

export const useHasScroll = (ref: RefObject<HTMLElement | null>) => {
  const [hasScroll, setHasScroll] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const checkScroll = () => {
      console.log(el, el.scrollHeight, el.clientHeight);
      setHasScroll(el.scrollHeight > el.clientHeight);
    };

    checkScroll();

    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => observer.disconnect();
  }, [ref.current]);

  return hasScroll;
};
