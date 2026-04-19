import { CharacterClass } from '@fwo/shared';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { characterClassNameMap } from '@/constants/character';
import { CharacterExp } from '@/modules/character/components/CharacterExp';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { useCharacter } from '@/modules/character/store/character';
import { formatNumber } from '@/utils/formatNumber';

export const CharacterPage: FC = () => {
  const navigate = useNavigate();
  const character = useCharacter();

  return (
    <div className="flex flex-col gap-2 m-3!">
      <Card header={character.name} className="relative bg-transparent!">
        <img
          src="/images/characterBackground.png"
          className="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-cover object-bottom -z-10"
        />
        <div className="mt-20 mb-2">
          <CharacterImage characterClass={character.class} />
        </div>

        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 text-sm">
          <Card className="py-0 flex justify-center">
            {characterClassNameMap[character.class]} {character.lvl}
          </Card>
          <Card className="py-0 px-0 min-w-32">
            <CharacterExp />
          </Card>
        </div>
        <div className="w-full flex items-start justify-between gap-2">
          <Card className="py-0.5 px-2">{formatNumber(character.gold)}💰</Card>

          <Card className="py-0.5 px-3">{formatNumber(character.bonus)}💡</Card>
        </div>
      </Card>

      <div className="flex gap-2 flex-col">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => navigate('/character/attributes')}>
            Характеристики
          </Button>

          {character.class === CharacterClass.Archer ||
          character.class === CharacterClass.Warrior ? (
            <Button className="flex-1" onClick={() => navigate('/character/skills')}>
              Умения
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => navigate('/character/magics')}>
              Магии
            </Button>
          )}
        </div>

        <Button onClick={() => navigate('/character/passive-skills')}>Пассивные навыки</Button>

        <Button onClick={() => navigate('/character/inventory')}>Инвентарь</Button>
        {character.clan ? (
          <Button onClick={() => navigate(`/character/clan`)}>Клан</Button>
        ) : (
          <Button onClick={() => navigate('/character/clan/list')}>Кланы</Button>
        )}
      </div>
    </div>
  );
};
