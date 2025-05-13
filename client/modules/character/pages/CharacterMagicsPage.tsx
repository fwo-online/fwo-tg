import { getAvailableMagicLevels, getMagicList } from '@/api/magic';
import { Suspense } from 'react';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useCharacter } from '@/modules/character/store/character';
import { CharacterMagicList } from '@/modules/character/components/CharacterMagicList';
import { CharacterMagicsLearnModal } from '@/modules/character/components/CharacterMagicLearnModal';
import useSWR from 'swr';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const fetcher = async (magicKeys: string[]) => {
  const [magics, avaiableMagicLevels] = await Promise.all([
    getMagicList(magicKeys),
    getAvailableMagicLevels(),
  ]);

  return {
    magics,
    avaiableMagicLevels,
  };
};

const CharacterMagicListLoader = () => {
  const magics = useCharacter((character) => character.magics);

  const { data } = useSWR(['magics', Object.keys(magics)], ([_, magicKeys]) => fetcher(magicKeys), {
    suspense: true,
  });

  return (
    <div className="flex flex-col gap-4">
      <CharacterMagicList magics={data.magics} />
      <CharacterMagicsLearnModal avaiableMagicLevels={data.avaiableMagicLevels} />
    </div>
  );
};

export const CharacterMagicsPage = () => {
  return (
    <div className="flex flex-col gap-2 m-4!">
      <Card header="Магии">
        <ErrorBoundary fallback={<Placeholder description="Произошла ошибка при загрузке магии" />}>
          <Suspense fallback={<Placeholder description="Ищем магии..." />}>
            <CharacterMagicListLoader />
          </Suspense>
        </ErrorBoundary>
      </Card>
    </div>
  );
};
