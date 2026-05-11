import type { Magic } from '@fwo/shared';
import type { FC } from 'react';
import { Description } from '@/components/Description';
import { useCharacter } from '@/modules/character/store/character';

export const MagicCard: FC<{
  magic: Magic;
}> = ({ magic }) => {
  const character = useCharacter();
  const currentLevel = character.magics[magic.name] ?? 0;

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-sm">{magic.description}</span>
        <Description>
          <Description.Item after={magic.lvl}>Уровень</Description.Item>
          <Description.Item after={`💧${magic.cost}`}>Стоимость</Description.Item>
          {currentLevel > 0 && (
            <Description.Item after={currentLevel}>Текущий уровень</Description.Item>
          )}
        </Description>
      </div>
    </div>
  );
};
