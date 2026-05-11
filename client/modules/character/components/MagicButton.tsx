import type { Magic } from '@fwo/shared';
import classNames from 'classnames';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import { useCharacter } from '@/modules/character/store/character';

export const MagicButton: FC<{
  selected: boolean;
  magic: Magic;
  onClick: () => void;
}> = ({ selected, magic, onClick }) => {
  const magicLevel = useCharacter((character) => character.magics[magic.name]);

  return (
    <Button onClick={onClick} className={classNames({ 'is-primary': selected })}>
      <div className="flex justify-between items-center text-sm">
        {magic.displayName}
        <div className="opacity-50">{magicLevel ?? 0}</div>
      </div>
    </Button>
  );
};
