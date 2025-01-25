import { Card, List, Section } from '@telegram-apps/telegram-ui';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { Outlet } from 'react-router';

export const CharacterInventoryPage = () => {
  return (
    <List>
      <Card style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}>
        <CharacterImage />
      </Card>
      <Section>
        <Outlet />
      </Section>
    </List>
  );
};
