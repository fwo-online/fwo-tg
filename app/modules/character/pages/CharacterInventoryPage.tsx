import { Card, List, Section } from '@telegram-apps/telegram-ui';
import { CharacterImage } from '../components/CharacterImage';
import { CharacterInventory } from '../components/CharacterInventory';
import { useCharacter } from '@/hooks/useCharacter';

export const CharacterInventoryPage = () => {
  const { character } = useCharacter();
  return (
    <List>
      <Card style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}>
        <CharacterImage />
      </Card>
      <Section style={{ overflow: 'auto', maxHeight: '100%' }}>
        <CharacterInventory inventory={character.inventory} />
      </Section>
    </List>
  );
};
