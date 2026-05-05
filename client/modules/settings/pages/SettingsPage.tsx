import type { Character } from '@fwo/shared';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getMyCharacters, activateCharacter } from '@/api/character';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { characterClassNameMap } from '@/constants/character';
import { useRequest } from '@/hooks/useRequest';
import { useCharacter } from '@/modules/character/store/character';
import { useNotificationSettings } from '@/modules/settings/hooks/useNotificationSettings';
import { useSettingsCharacter } from '@/modules/settings/hooks/useSettingsCharacter';
import { useSettingsClan } from '@/modules/settings/hooks/useSettingsClan';

const notificationTypes = [
  { key: 'gameStart' as const, label: 'Начало игры' },
  { key: 'afkWarning' as const, label: 'AFK' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const character = useCharacter();
  const { removeCharacter } = useSettingsCharacter();
  const { removeClan, leaveClan } = useSettingsClan();
  const { toggleNotification, getNotificationEnabled, loading } = useNotificationSettings();
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [_, makeRequest] = useRequest();

  const isClanOwner = character.clan?.owner === character.id;

  useEffect(() => {
    getMyCharacters().then(setMyCharacters).catch(() => {});
  }, []);

  const handleActivate = async (id: string) => {
    await makeRequest(async () => {
      await activateCharacter(id);
      window.location.reload();
    });
  };

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

      {myCharacters.length > 0 && (
        <Card header="Персонажи" className="m-4 mb-8">
          <div className="flex flex-col gap-2">
            {myCharacters.map((char) => (
              <div key={char.id} className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{char.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {characterClassNameMap[char.class]} {char.lvl} ур.
                  </span>
                  {char.active && (
                    <span className="text-xs text-green-500 ml-1">(активный)</span>
                  )}
                </div>
                {!char.active && (
                  <Button onClick={() => handleActivate(char.id)}>Переключить</Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button className="is-primary w-full" onClick={() => navigate('/create')}>
              Создать нового
            </Button>
          </div>
        </Card>
      )}

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
