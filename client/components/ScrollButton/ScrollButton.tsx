import type { FC, RefObject } from 'react';
import { Button } from '@/components/Button';
import { useHasScroll } from '@/hooks/useHasScroll';

export const ScrollButton: FC<{ scrollContainerRef: RefObject<HTMLElement | null> }> = ({
  scrollContainerRef,
}) => {
  const hasScroll = useHasScroll(scrollContainerRef);

  const handleScroll = () => {
    scrollContainerRef.current?.scrollBy({
      top: scrollContainerRef.current.clientHeight,
      behavior: 'smooth',
    });
  };

  if (hasScroll) {
    return (
      <Button className="sticky bottom-2 left-0 right-0 p-0" onClick={handleScroll}>
        ↓
      </Button>
    );
  }
};
