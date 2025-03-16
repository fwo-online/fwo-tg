import { useCharacter } from '@/contexts/character';
import { Banner, Button, ButtonCell, List, Modal, Section } from '@telegram-apps/telegram-ui';
import { times } from 'es-toolkit/compat';
import { useCharacterLearnMagic } from '../hooks/useCharacterLearnMagic';

export const CharacterMagicsLearnModal = () => {
  const { character } = useCharacter();
  const { isLearning, handleLearn } = useCharacterLearnMagic();

  return (
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
  );
};
