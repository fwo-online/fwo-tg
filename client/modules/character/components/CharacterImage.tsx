import { type FC, useEffect, useRef } from 'react';
import { drawCharacter } from '@/modules/character/hooks/useDrawCharacter';
import type { CharacterClass } from '@fwo/shared';

export const CharacterImage: FC<{ characterClass: CharacterClass }> = ({ characterClass }) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas.current) {
      drawCharacter(canvas.current, characterClass);
    }
  }, [characterClass]);

  return (
    <canvas ref={canvas} style={{ display: 'block', margin: 'auto' }} width={200} height={125} />
  );
};
