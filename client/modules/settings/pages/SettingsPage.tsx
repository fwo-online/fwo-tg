import { deleteCharacter } from '@/api/character';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { popup } from '@telegram-apps/sdk-react';
import { ButtonCell, List, Navigation, Section } from '@telegram-apps/telegram-ui';

export function SettingsPage() {
  const { updateCharacter } = useUpdateCharacter();

  const handleClick = async () => {
    const buttonId = await popup.open({
      title: 'Удаление персонажа',
      message: 'Персонаж будет удалён навсегда',
      buttons: [{ text: 'Удалить', type: 'destructive', id: 'delete' }, { type: 'cancel' }],
    });

    if (buttonId === 'delete') {
      await deleteCharacter().then(updateCharacter);
    }
  };

  return (
    <List>
      <Section>
        <Section.Header>Настройки</Section.Header>
        <ButtonCell onClick={handleClick}>
          <Navigation> Удалить персонажа</Navigation>
        </ButtonCell>
      </Section>
    </List>
  );
}
