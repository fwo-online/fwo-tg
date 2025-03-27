import { deleteCharacter } from '@/api/character';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useModal } from '@/contexts/modal';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';

export function SettingsPage() {
  const { updateCharacter } = useUpdateCharacter();
  const modal = useModal();

  const handleClick = async () => {
    modal.confirm({
      message: 'Персонаж будет удалён навсегда',
      onConfirm: async (done) => {
        await deleteCharacter().then(updateCharacter).finally(done);
      },
    });
  };

  return (
    <Card header="Настройки" className="m-4!">
      <Button onClick={handleClick}>Удалить персонажа</Button>
    </Card>
  );
}
