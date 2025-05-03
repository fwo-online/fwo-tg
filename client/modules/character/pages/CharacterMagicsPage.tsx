import { getMagicList } from '@/api/magic';
import { Suspense } from 'react';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useCharacter } from '@/modules/character/store/character';
import { CharacterMagicList } from '@/modules/character/components/CharacterMagicList';
import { CharacterMagicsLearnModal } from '@/modules/character/components/CharacterMagicLearnModal';
import useSWR from 'swr';

const CharacterMagicListLoader = () => {
  const magicKeys = useCharacter((character) => Object.keys(character.magics));
  const { data } = useSWR(['magics', magicKeys], ([_, magicKeys]) => getMagicList(magicKeys), {
    suspense: true,
  });

  return <CharacterMagicList magics={data} />;
};

export const CharacterMagicsPage = () => {
  return (
    <div className="flex flex-col gap-2 m-4!">
      <Card header="Магии">
        <Suspense fallback={<Placeholder description="Ищем магии..." />}>
          <CharacterMagicListLoader />
        </Suspense>
      </Card>

      <CharacterMagicsLearnModal />
    </div>
  );
};
