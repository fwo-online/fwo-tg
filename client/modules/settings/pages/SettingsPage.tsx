import { deleteCharacter } from '@/api/character';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { popup } from '@telegram-apps/sdk-react';

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
    <Card header="Настройки" className="m-4!">
      <Button onClick={handleClick}>Удалить персонажа</Button>
    </Card>
  );
}
