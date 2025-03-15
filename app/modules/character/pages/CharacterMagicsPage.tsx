import { getMagicList } from '@/client/magic';
import { useCharacter } from '@/contexts/character';
import {
  Banner,
  Button,
  ButtonCell,
  List,
  Modal,
  Section,
  Spinner,
} from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import type { Magic } from '@fwo/schemas';
import { CharacterMagicList } from '../components/CharacterMagicList';
import { times } from 'es-toolkit/compat';
import { useCharacterLearnMagic } from '../hooks/useCharacterLearnMagic';

export const CharacterMagicsPage = () => {
  const { character } = useCharacter();
  const { isLearning, handleLearn } = useCharacterLearnMagic();

  const [magics, setMagics] = useState<Magic[]>([]);

  useEffect(() => {
    getMagicList(Object.keys(character.magics)).then((magics) => {
      setMagics(magics ?? []);
    });
  }, [character.magics]);

  if (!magics.length) {
    return <Spinner size="l" />;
  }

  return (
    <List>
      <Section>
        <Section.Header>Магии</Section.Header>
        <CharacterMagicList magics={magics} />
      </Section>

      <Modal trigger={<ButtonCell>Изучить</ButtonCell>}>
        <Section>
          <Banner
            header="Изучение магии"
            description=" Выбери уровень изучаемой магии. Стоимость изучения равна уровню магии"
          >
            {times(4, (i) => i + 1).map((lvl) => (
              <Button
                key={lvl}
                loading={isLearning}
                stretched
                disabled={lvl > character.bonus || lvl > character.lvl || isLearning}
                onClick={() => handleLearn(lvl)}
              >
                {lvl}💡
              </Button>
            ))}
          </Banner>
          <List>
            <Button stretched mode="plain">
              У тебя {character.bonus}💡
            </Button>
          </List>
        </Section>
      </Modal>
    </List>
  );
};
