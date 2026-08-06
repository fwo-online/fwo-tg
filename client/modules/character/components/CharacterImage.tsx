import type { CharacterClass } from '@fwo/shared';
import { createEffect, createMemo } from 'solid-js';
import { drawCharacter } from '@/modules/character/hooks/useDrawCharacter';

export function CharacterImage(props: { characterClass: CharacterClass; small?: boolean }) {
  let canvas!: HTMLCanvasElement;

  const width = createMemo(() => (props.small ? 20 : 100));
  const height = createMemo(() => (props.small ? 20 : 100));

  createEffect(
    () => props.characterClass,
    (characterClass) => {
      drawCharacter(canvas, characterClass);
    },
  );

  return <canvas ref={canvas} style={{ margin: 'auto' }} width={width()} height={height()} />;
}
