import type { Magic } from '@fwo/shared';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { getAvailableMagicLevels, getMagicList } from '@/api/magic';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useMountEffect } from '@/hooks/useMountEffect';
import { CharacterMagicsLearnModal } from '@/modules/character/components/CharacterMagicLearnModal';
import { CharacterMagicList } from '@/modules/character/components/CharacterMagicList';
import { MagicCard } from '@/modules/character/components/MagicCard';

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

const handle = {
  title: 'Магии',
};

const ErrorBoundary = () => {
  return <Placeholder description="Ошибка загрузки магий" />;
};

export const CharacterMagicsPage = () => {
  const { magics, avaiableMagicLevels } = useLoaderData<typeof loader>();
  const [selectedMagic, setSelectedMagic] = useState<Magic>();

  useMountEffect(() => {
    setSelectedMagic(magics[0]);
  });

  return (
    <div className="h-screen flex flex-col">
      <Card header="Магии" className="m-4 mb-1">
        <div className="max-h-[45vh] overflow-y-auto">
          <CharacterMagicList
            magics={magics}
            selectedMagic={selectedMagic}
            onSelect={setSelectedMagic}
          />
        </div>
      </Card>
      <Card className="m-4 mt-0 flex-1 flex flex-col">
        {selectedMagic ? <MagicCard magic={selectedMagic} /> : null}
      </Card>

      <div className="flex p-4">
        <CharacterMagicsLearnModal avaiableMagicLevels={avaiableMagicLevels} />
      </div>
    </div>
  );
};

CharacterMagicsPage.loader = loader;
CharacterMagicsPage.ErrorBoundary = ErrorBoundary;
CharacterMagicsPage.handle = handle;
