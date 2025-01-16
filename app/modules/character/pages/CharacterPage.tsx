import { Card, Cell, InlineButtons, List, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { useCharacter } from '@/hooks/useCharacter';
import { CharacterImage } from '@/components/character/CharacterImage';
import { characterClassNameMap } from '@/constants/character';
import { useNavigate } from 'react-router';

export const CharacterPage: FC = () => {
  const navigate = useNavigate();
  const { character } = useCharacter();
  return (
    <List>
      <Card style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}>
        <Card.Chip>lvl {character.lvl}</Card.Chip>
        <CharacterImage />
        <Card.Cell>{character.name}</Card.Cell>
      </Card>
      <Section>
        <Cell subhead="Класс">{characterClassNameMap[character.class]}</Cell>
        <Cell subhead="Золото">{character.gold}</Cell>
        <Cell subhead="Опыт">{character.exp}</Cell>
      </Section>
      <Section>
        <InlineButtons>
          <InlineButtons.Item onClick={() => navigate('/character/attributes')}>
            Характеристики
          </InlineButtons.Item>
          <InlineButtons.Item onClick={() => navigate('/character/magics')}>
            Магии
          </InlineButtons.Item>
        </InlineButtons>
      </Section>
    </List>
  );
};
