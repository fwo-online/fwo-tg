import { getMagicList } from '@/client/magic';
import { useCharacter } from '@/contexts/character';
import { List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { Suspense } from 'react';
import { CharacterMagicList } from '../components/CharacterMagicList';
import { CharacterMagicsLearnModal } from '../components/CharacterMagicLearnModal';

export const CharacterMagicsPage = () => {
  const { character } = useCharacter();

  return (
    <List>
      <Section>
        <Section.Header>Магии</Section.Header>
        <Suspense fallback={<Placeholder description="Ищем магии..." />}>
          <CharacterMagicList magicsSource={getMagicList(Object.keys(character.magics))} />
        </Suspense>
      </Section>

      <CharacterMagicsLearnModal />
    </List>
  );
};
