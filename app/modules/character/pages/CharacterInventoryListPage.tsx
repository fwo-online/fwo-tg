import type { FC } from 'react';
import { useParams } from 'react-router';
import { List, Section } from '@telegram-apps/telegram-ui';
import { wearListTranslations } from '@/constants/inventory';
import { CharacterInventoryList } from '../components/CharacterInventoryList';
import { useCharacter } from '@/contexts/character';

export const CharacterInventoryListPage: FC = () => {
  const { wear } = useParams();
  const { character } = useCharacter();

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
