import { getMagicList, learnMagic } from '@/client/magic';
import { useCharacter } from '@/hooks/useCharacter';
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
import { popup } from '@telegram-apps/sdk-react';
import { CharacterMagicList } from '../components/CharacterMagicList';
import { times } from 'es-toolkit/compat';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';

export const CharacterMagicsPage = () => {
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();

  const [magics, setMagics] = useState<Magic[]>([]);

  useEffect(() => {
    getMagicList(Object.keys(character.magics)).then((magics) => {
      setMagics(magics ?? []);
    });
  }, [character.magics]);

  const handleLearn = async (lvl: number) => {
    const id = await popup.open({
      message: `Стоимость изучения ${lvl}💡`,
      buttons: [
        {
          id: 'close',
          type: 'close',
        },
        {
          id: 'ok',
          type: 'ok',
        },
      ],
    });

    if (id === 'ok') {
      const magic = await learnMagic(lvl);
      if (magic) {
        await popup.open({
          title: 'Успешное изучение',
          message: `${magic.displayName}`,
        });
        await updateCharacter();
      } else {
        await popup.open({
          title: 'Не удалось изучить',
          message: 'Бонусы не возвращаем',
        });
      }
    }
  };

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
                stretched
                disabled={lvl > character.bonus}
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
