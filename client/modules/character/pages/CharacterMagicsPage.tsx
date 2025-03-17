import { getMagicList } from '@/api/magic';
import { useCharacter } from '@/contexts/character';
import { Placeholder } from '@telegram-apps/telegram-ui';
import { Suspense } from 'react';
import { CharacterMagicList } from '../components/CharacterMagicList';
import { CharacterMagicsLearnModal } from '../components/CharacterMagicLearnModal';
import { Card } from '@/components/Card';

export const CharacterMagicsPage = () => {
  const { character } = useCharacter();

  return (
    <div className="flex flex-col gap-2 m-4!">
      <Card header="Магии">
        <Suspense fallback={<Placeholder description="Ищем магии..." />}>
          <CharacterMagicList magicsSource={getMagicList(Object.keys(character.magics))} />
        </Suspense>
      </Card>

      <CharacterMagicsLearnModal />
    </div>
  );
};
