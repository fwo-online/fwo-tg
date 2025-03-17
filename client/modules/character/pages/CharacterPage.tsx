import type { FC } from 'react';

import { useCharacter } from '@/contexts/character';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { characterClassNameMap } from '@/constants/character';
import { useNavigate } from 'react-router';
import { CharacterClass } from '@fwo/shared';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const CharacterPage: FC = () => {
  const navigate = useNavigate();
  const { character } = useCharacter();

  return (
    <div className="flex flex-col gap-2 m-3!">
      <Card header="Персонаж" className="relative">
        <div className="mt-12">
          <CharacterImage />
        </div>

        <Card className="absolute top-2 left-2 font-bold">{character.name}</Card>
        <Card className="absolute top-2 right-2">
          {characterClassNameMap[character.class]} {character.lvl}
        </Card>
        <div className="flex gap-2">
          <Card className="flex flex-1 flex-col justify-center items-center p-1">
            Опыт
            <span>{character.gold}</span>
          </Card>

          <Card className="flex flex-1 flex-col justify-center items-center">
            Опыт
            <span>{character.exp}</span>
          </Card>

          <Card className="flex flex-1 flex-col justify-center items-center">
            Бонусы
            <span>{character.bonus}</span>
          </Card>
        </div>
      </Card>

      <div className="flex gap-2 flex-col">
        <Button onClick={() => navigate('/character/attributes')}>Характеристики</Button>

        {character.class === CharacterClass.Archer || character.class === CharacterClass.Warrior ? (
          <Button onClick={() => navigate('/character/skills')}>Умения</Button>
        ) : (
          <Button onClick={() => navigate('/character/magics')}>Магии</Button>
        )}
        <Button onClick={() => navigate('/character/inventory')}>Инвентарь</Button>
      </div>
    </div>
  );
};
