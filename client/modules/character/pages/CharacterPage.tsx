import { type Character, CharacterClass } from '@fwo/shared';
import { useNavigate } from '@solidjs/router';
import type { Accessor } from 'solid-js';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { characterClassNameMap } from '@/constants/character';
import { CharacterExp } from '@/modules/character/components/CharacterExp';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { getCharacter } from '@/modules/character/store/character';
import { formatNumber } from '@/utils/formatNumber';

export const CharacterPage = () => {
  const navigate = useNavigate();
  const character: Accessor<Character> = () => getCharacter();

  return (
    <div class="flex flex-col gap-2 m-3!">
      <Card header={character().name} class="relative bg-transparent!">
        <img
          src="/images/characterBackground.png"
          class="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-cover object-bottom -z-10"
        />
        <div class="mt-20 mb-2">
          <CharacterImage characterClass={character().class} />
        </div>

        <div class="absolute top-2 right-2 flex flex-col items-end gap-1 text-sm">
          <Card class="py-0 flex justify-center">
            {characterClassNameMap[character().class]} {character().lvl}
          </Card>
          <Card class="py-0 px-0 min-w-32">
            <CharacterExp />
          </Card>
        </div>
        <div class="w-full flex items-start justify-between gap-2">
          <Card class="py-0.5 px-2">{formatNumber(character().gold)}💰</Card>

          <Card class="py-0.5 px-3">{formatNumber(character().bonus)}💡</Card>
        </div>
      </Card>

      <div class="flex gap-2 flex-col">
        <div class="flex gap-2">
          <Button class="flex-1" onClick={() => navigate('/character/attributes')}>
            Характеристики
          </Button>

          <Button class="flex-1" onClick={() => navigate('/character/inventory')}>
            Инвентарь
          </Button>
        </div>

        <div class="flex gap-2">
          {character().class === CharacterClass.Archer ||
          character().class === CharacterClass.Warrior ? (
            <Button class="flex-1" onClick={() => navigate('/character/skills')}>
              Умения
            </Button>
          ) : (
            <Button class="flex-1" onClick={() => navigate('/character/magics')}>
              Магии
            </Button>
          )}
          <Button class="flex-1" onClick={() => navigate('/character/passive-skills')}>
            Навыки
          </Button>
        </div>

        {/* <ContractsModal trigger={<Button>Контракты</Button>} /> */}

        {character().clan ? (
          <Button onClick={() => navigate(`/character/clan`)}>Клан</Button>
        ) : (
          <Button onClick={() => navigate('/character/clan/list')}>Кланы</Button>
        )}
      </div>
    </div>
  );
};
