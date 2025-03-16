import { List, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { ShopWearList } from '../components/ShopWearList';

export const ShopPage: FC = () => {
  return (
    <List>
      <Section>
        <Section.Header>Магазин</Section.Header>
        <ShopWearList />
      </Section>
    </List>
  );
};
