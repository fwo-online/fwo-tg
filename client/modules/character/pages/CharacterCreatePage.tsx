import type { Character, CreateCharacterDto } from '@fwo/shared';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { createCharacter, getMyCharacters, activateCharacter } from '@/api/character';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { characterClassNameMap } from '@/constants/character';
import { useRequest } from '@/hooks/useRequest';
import { SelectCharacter } from '@/modules/character/components/CharacterSelect';

export const CharacterCreatePage = () => {
  const navigate = useNavigate();
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [_, makeRequest] = useRequest();

  useEffect(() => {
    getMyCharacters().then(setMyCharacters).catch(() => {});
  }, []);

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    await makeRequest(async () => {
      const character = await createCharacter(createCharacterDto);
      if (character) {
        window.location.href = '/';
      }
    });
  };

  const handleActivate = async (id: string) => {
    await makeRequest(async () => {
      await activateCharacter(id);
      window.location.reload();
    });
  };

  // No existing characters — show creation form directly
  if (myCharacters.length === 0) {
    return <SelectCharacter onSelect={onSelect} />;
  }

  // Has characters — show list + optional creation form
  return (
    <>
      <Card header="Твои персонажи" className="m-4">
        <div className="flex flex-col gap-2">
          {myCharacters.map((char) => (
            <div key={char.id} className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{char.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {characterClassNameMap[char.class]} {char.lvl} ур.
                </span>
              </div>
              {char.active ? (
                <Button onClick={() => navigate('/character')}>Войти</Button>
              ) : (
                <Button onClick={() => handleActivate(char.id)}>Сменить</Button>
              )}
            </div>
          ))}
        </div>
        {!showCreateForm && (
          <div className="mt-4">
            <Button className="is-primary w-full" onClick={() => setShowCreateForm(true)}>
              Создать нового
            </Button>
          </div>
        )}
      </Card>

      {showCreateForm && (
        <>
          <SelectCharacter onSelect={onSelect} />
          <div className="mx-4 mb-4">
            <Button className="w-full" onClick={() => setShowCreateForm(false)}>
              Отмена
            </Button>
          </div>
        </>
      )}
    </>
  );
};
