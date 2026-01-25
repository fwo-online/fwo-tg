import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCharacter } from '@/modules/character/store/character';
import { useNotificationSettings } from '@/modules/settings/hooks/useNotificationSettings';
import { useSettingsCharacter } from '@/modules/settings/hooks/useSettingsCharacter';
import { useSettingsClan } from '@/modules/settings/hooks/useSettingsClan';

const notificationTypes = [
  { key: 'gameStart' as const, label: 'Начало игры' },
  { key: 'afkWarning' as const, label: 'AFK' },
];

export function SettingsPage() {
  const character = useCharacter();
  const { removeCharacter } = useSettingsCharacter();
  const { removeClan, leaveClan } = useSettingsClan();
  const { toggleNotification, getNotificationEnabled, loading } = useNotificationSettings();

  const isClanOwner = character.clan?.owner === character.id;

  return (
    <>
      <Card header="Уведомления" className="m-4 mb-8">
        <div className="flex flex-col gap-2">
          {notificationTypes.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span>{label}</span>
              <Button
                className="p-0"
                disabled={loading}
                onClick={() => toggleNotification(key, !getNotificationEnabled(key))}
              >
                {getNotificationEnabled(key) ? 'Вкл' : 'Выкл'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card header="Управление аккаунтом" className="m-4">
        <div className="flex flex-col gap-2">
          <Button onClick={removeCharacter}>Удалить персонажа</Button>
          {isClanOwner && <Button onClick={removeClan}>Удалить клан</Button>}
          {character.clan && !isClanOwner && <Button onClick={leaveClan}>Покинуть клан</Button>}
        </div>
      </Card>
    </>
  );
}
