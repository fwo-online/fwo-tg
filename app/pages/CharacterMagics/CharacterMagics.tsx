import { getMagicList, learnMagic } from '@/client/magic';
import { useCharacter } from '@/hooks/useCharacter';
import { Button, ButtonCell, Cell, List, Modal, Spinner } from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import type { Magic } from '@fwo/schemas';
import { popup } from '@telegram-apps/sdk-react';

export const CharacterMagics = () => {
  const { character } = useCharacter();

  const [magics, setMagics] = useState<Magic[]>([]);

  useEffect(() => {
    getMagicList(Object.keys(character.magics)).then((magics) => {
      setMagics(magics ?? []);
    });
  }, [character.magics]);

  const Magic = ({ magic }: { magic: Magic }) => {
    const { lvl, cost, displayName, desc, name } = magic;
    return (
      <Modal
        header={<Modal.Header>Only iOS header</Modal.Header>}
        trigger={
          <ButtonCell>
            {displayName}: {character.magics[name]}
          </ButtonCell>
        }
      >
        <List>
          <Cell subhead="Name">{displayName}</Cell>
          <Cell subhead="Description">{desc}</Cell>
          <Cell subhead="Level">{lvl}</Cell>
          <Cell subhead="Cost">{cost}💧</Cell>
        </List>
      </Modal>
    );
  };

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
      {magics.map((magic) => (
        <Magic key={magic.name} magic={magic} />
      ))}
      <Modal trigger={<ButtonCell>Изучить</ButtonCell>}>
        <List>
          <Button stretched onClick={() => handleLearn(1)}>
            1
          </Button>
        </List>
      </Modal>
    </List>
  );
};
