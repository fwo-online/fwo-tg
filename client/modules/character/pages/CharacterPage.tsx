import type { FC } from 'react';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { characterClassNameMap } from '@/constants/character';
import { useNavigate } from 'react-router';
import { CharacterClass } from '@fwo/shared';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useCharacter } from '@/modules/character/store/character';
import { formatNumber } from '@/utils/formatNumber';
import { CharacterExp } from '@/modules/character/components/CharacterExp';

export const CharacterPage: FC = () => {
  const navigate = useNavigate();
  const character = useCharacter();

  return (
    <div className="flex flex-col gap-2 m-3!">
      <Card header="Персонаж" className="relative bg-transparent!">
        <img
          src="/images/characterBackground.png"
          className="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-cover object-bottom -z-10"
        />
        <div className="mt-20 mb-2">
          <CharacterImage characterClass={character.class} />
        </div>

        <Card className="absolute top-2 left-2 font-bold">{character.name}</Card>
        <Card className="absolute top-2 right-2">
          {characterClassNameMap[character.class]} {character.lvl}
        </Card>
        <div className="flex gap-2">
          <Card className="flex flex-1 flex-col justify-center items-center py-0.5 px-0">
            <span className="text-sm">{formatNumber(character.gold)}💰</span>
          </Card>

          <Card className="flex flex-2 flex-col justify-center items-center py-0 px-0">
            <CharacterExp />
          </Card>

          <Card className="flex flex-1 flex-col justify-center items-center py-0.5 px-0">
            <span className="text-sm">{formatNumber(character.bonus)}💡</span>
          </Card>
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

        <Button onClick={() => navigate('/character/passiveSkills')}>Пассивные навыки</Button>

        <Button onClick={() => navigate('/character/inventory')}>Инвентарь</Button>
        {character.clan ? (
          <Button onClick={() => navigate('/character/clan')}>Клан</Button>
        ) : (
          <Button onClick={() => navigate('/character/clan/list')}>Кланы</Button>
        )}
      </div>
    </div>
  );
};
