import {
  ButtonCell,
  Card,
  Cell,
  InlineButtons,
  List,
  Navigation,
  Section,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { useCharacter } from '@/hooks/useCharacter';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { characterClassNameMap } from '@/constants/character';
import { useNavigate } from 'react-router';
import { CharacterClass } from '@fwo/schemas';

export const CharacterPage: FC = () => {
  const navigate = useNavigate();
  const { character } = useCharacter();
  return (
    <List>
      <Card style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}>
        <Card.Chip>
          {characterClassNameMap[character.class]} {character.lvl}
        </Card.Chip>
        <CharacterImage />
        <Card.Cell>{character.name}</Card.Cell>
      </Card>
      <Section>
        <InlineButtons>
          <InlineButtons.Item text={character.gold.toString()}>💰</InlineButtons.Item>
          <InlineButtons.Item text={character.exp.toString()}>📖</InlineButtons.Item>
          <InlineButtons.Item text={character.bonus.toString()}>💡</InlineButtons.Item>
        </InlineButtons>
      </Section>
      <Section>
        <ButtonCell onClick={() => navigate('/character/attributes')}>
          <Navigation>Характеристики</Navigation>
        </ButtonCell>

        {character.class === CharacterClass.Archer || character.class === CharacterClass.Warrior ? (
          <ButtonCell onClick={() => navigate('/character/skills')}>
            <Navigation>⚡️ Умения</Navigation>
          </ButtonCell>
        ) : (
          <ButtonCell onClick={() => navigate('/character/magics')}>
            <Navigation>Магии</Navigation>
          </ButtonCell>
        )}
        <ButtonCell onClick={() => navigate('/character/inventory')}>
          <Navigation>Инвентарь</Navigation>
        </ButtonCell>
      </Section>
    </List>
  );
};
