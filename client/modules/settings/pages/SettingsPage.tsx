import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCharacter } from '@/contexts/character';
import { ServiceShop } from '@/modules/serviceShop/components/ServiceShop';
import { useSettingsCharacter } from '@/modules/settings/hooks/useSettingsCharacter';
import { useSettingsClan } from '@/modules/settings/hooks/useSettingsClan';

export function SettingsPage() {
  const { character } = useCharacter();
  const { removeCharacter } = useSettingsCharacter();
  const { removeClan, leaveClan } = useSettingsClan();

  const isClanOwner = character.clan?.owner === character.id;

  return (
    <Card header="Настройки" className="m-4!">
      <div className="flex flex-col gap-2">
        <Button onClick={removeCharacter}>Удалить персонажа</Button>
        {isClanOwner && <Button onClick={removeClan}>Удалить клан</Button>}
        {character.clan && !isClanOwner && <Button onClick={leaveClan}>Покинуть клан</Button>}
        <ServiceShop />
      </div>
    </Card>
  );
}
