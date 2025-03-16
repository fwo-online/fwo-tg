import type { FC } from 'react';
import { Navigate, useParams } from 'react-router';
import { List, Section } from '@telegram-apps/telegram-ui';
import { wearListTranslations } from '@/constants/inventory';
import { CharacterInventoryList } from '../components/CharacterInventoryList';
import { useCharacter } from '@/contexts/character';
import { validateWear } from '@/utils/inventory';

export const CharacterInventoryListPage: FC = () => {
  const { wear } = useParams();
  const { character } = useCharacter();

  if (!validateWear(wear)) {
    return <Navigate to="/error" />;
  }

  const inventory = character.inventory?.filter((item) => item.wear === wear);

  return (
    <List>
      <Section>
        <Section.Header>{wearListTranslations[wear]}</Section.Header>
        <CharacterInventoryList inventory={inventory} />
      </Section>
    </List>
  );
};
