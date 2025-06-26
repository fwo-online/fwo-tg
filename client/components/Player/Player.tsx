import type { CharacterClass } from '@fwo/shared';
import classNames from 'classnames';
import type { FC } from 'react';
import { CharacterImage } from '@/modules/character/components/CharacterImage';

export const Player: FC<{
  className?: string;
  class: CharacterClass;
  name: string;
  lvl?: number;
  isBot?: boolean;
}> = ({ className, class: characterClass, name, lvl, isBot }) => {
  return (
    <div className={classNames('inline-flex justify-start gap-2', className)}>
      {lvl ? lvl : null}
      {isBot ? null : <CharacterImage characterClass={characterClass} small />}
      <div className="flex-1">{name}</div>
    </div>
  );
};
