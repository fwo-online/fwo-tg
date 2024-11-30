import { deleteCharacter } from '@/client/character';
import { CharacterContext } from '@/contexts/character';
import { popup } from '@telegram-apps/sdk-react';
import { ButtonCell, List } from '@telegram-apps/telegram-ui';
import { use } from 'react';

export function SettingsPage() {
  const { resetCharacter } = use(CharacterContext);
  const handleClick = async () => {
    const buttonId = await popup.open({
      title: 'Удаление персонажа',
      message: 'Персонаж будет удалён навсегда',
      buttons: [{ text: 'Удалить', type: 'destructive', id: 'delete' }, { type: 'cancel' }],
    });

    if (buttonId === 'delete') {
      await deleteCharacter();
      resetCharacter();
    }
  };

  return (
    <List>
      <ButtonCell onClick={() => handleClick()}>Удалить персонажа</ButtonCell>
    </List>
  );
}
