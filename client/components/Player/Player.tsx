import { CharacterImage } from '@/modules/character/components/CharacterImage';
import type { CharacterClass } from '@fwo/shared';
import type { FC } from 'react';

export const Player: FC<{ class: CharacterClass; name: string; lvl?: number }> = ({
  class: characterClass,
  name,
  lvl,
}) => {
  return (
    <div className="flex justify-start gap-2">
      {lvl ? <>{lvl}</> : null}
      <CharacterImage characterClass={characterClass} small />
      <div className="flex-1">{name}</div>
    </div>
  );
};
