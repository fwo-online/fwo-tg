import { Suspense } from 'react';
import { useLoaderData } from 'react-router';
import { getAvailableMagicLevels, getMagicList } from '@/api/magic';
import { Card } from '@/components/Card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Placeholder } from '@/components/Placeholder';
import { CharacterMagicsLearnModal } from '@/modules/character/components/CharacterMagicLearnModal';
import { CharacterMagicList } from '@/modules/character/components/CharacterMagicList';

const loader = async () => {
  const [magics, avaiableMagicLevels] = await Promise.all([
    getMagicList(),
    getAvailableMagicLevels(),
  ]);

  return {
    magics,
    avaiableMagicLevels,
  };
};

export const CharacterMagicsPage = () => {
  const { magics, avaiableMagicLevels } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-2 m-4!">
      <Card header="Магии">
        <ErrorBoundary fallback={<Placeholder description="Произошла ошибка при загрузке магии" />}>
          <Suspense fallback={<Placeholder description="Ищем магии..." />}>
            <div className="flex flex-col gap-4">
              <CharacterMagicList magics={magics} />
              <CharacterMagicsLearnModal avaiableMagicLevels={avaiableMagicLevels} />
            </div>
          </Suspense>
        </ErrorBoundary>
      </Card>
    </div>
  );
};

CharacterMagicsPage.loader = loader;
