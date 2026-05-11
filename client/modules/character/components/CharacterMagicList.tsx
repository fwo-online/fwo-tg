import type { Magic } from '@fwo/shared';
import type { FC } from 'react';
import { MagicButton } from '@/modules/character/components/MagicButton';

export const CharacterMagicList: FC<{
  magics: Magic[];
  selectedMagic?: Magic;
  onSelect: (magic: Magic) => void;
}> = ({ magics, selectedMagic, onSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      {magics.map((magic) => (
        <MagicButton
          selected={selectedMagic?.name === magic.name}
          key={magic.name}
          magic={magic}
          onClick={() => onSelect(magic)}
        />
      ))}
    </div>
  );
};
