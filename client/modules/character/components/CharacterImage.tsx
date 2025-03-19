import { type FC, useEffect, useRef } from 'react';
import { drawCharacter } from '@/modules/character/hooks/useDrawCharacter';
import type { CharacterClass } from '@fwo/shared';

export const CharacterImage: FC<{ characterClass: CharacterClass; small?: boolean }> = ({
  characterClass,
  small,
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const width = small ? 20 : 100;
  const height = small ? 20 : 100;

  useEffect(() => {
    if (canvas.current) {
      drawCharacter(canvas.current, characterClass);
    }
  }, [characterClass]);

  return <canvas ref={canvas} style={{ margin: 'auto' }} width={width} height={height} />;
};
