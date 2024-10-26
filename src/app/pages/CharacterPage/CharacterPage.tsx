import { ButtonCell, Card, Cell, List, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { Link } from '@/app/components/Link/Link';
import { useCharacter } from '@/app/hooks/useCharacter';
import { Character } from '@/app/components/Character/Character';
import { characterClassNameMap } from '@/app/constants/character';

export const CharacterPage: FC = () => {
  const { character } = useCharacter();

  return (
    <List>
      <Card style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}>
        <Card.Chip>lvl {character.lvl}</Card.Chip>
        <Character />
        <Card.Cell>{character.name}</Card.Cell>
      </Card>
      <Section>
        <Cell subhead='Класс'>{characterClassNameMap[character.class]}</Cell>
        <Cell subhead='Золото'>{character.gold}</Cell>
        <Cell subhead='Опыт'>{character.exp}</Cell>
      </Section>
      <ButtonCell> <Link to="/character/attributes">Просмотр характеристик</Link></ButtonCell>
      <ButtonCell> <Link to="/character/magics"> Магии (wip) </Link></ButtonCell>
      <ButtonCell>Инвентарь (wip)</ButtonCell>
     
    </List>
  );
};
