import type { Character, CreateCharacterDto } from '@fwo/shared';
import { useNavigate } from '@solidjs/router';
import { createMemo, createSignal, For, Show } from 'solid-js';

import { activateCharacter, createCharacter, getMyCharacters } from '@/api/character';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

import { characterClassNameMap } from '@/constants/character';

import { useRequest } from '@/hooks/useRequest';

import { SelectCharacter } from '@/modules/character/components/CharacterSelect';

export function CharacterCreatePage() {
  const navigate = useNavigate();

  const [, makeRequest] = useRequest();

  const myCharacters = createMemo(() => getMyCharacters());

  const [showCreateForm, setShowCreateForm] = createSignal(false);

  const handleCreate = async (dto: CreateCharacterDto) => {
    await makeRequest(async () => {
      const character = await createCharacter(dto);

      if (character) {
        navigate('/', {
          replace: true,
        });
      }
    });
  };

  const handleActivate = async (id: string) => {
    await makeRequest(async () => {
      await activateCharacter(id);

      navigate('/', {
        replace: true,
      });
    });
  };

  return (
    <Show when={myCharacters()?.length} fallback={<SelectCharacter onSelect={handleCreate} />}>
      <Card header="Твои персонажи" class="m-4">
        <div class="flex flex-col gap-2">
          <For each={myCharacters()}>
            {(character) => (
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-semibold">{character.name}</span>

                  <span class="ml-2 text-sm text-gray-500">
                    {characterClassNameMap[character.class]} {character.lvl} ур.
                  </span>
                </div>

                <Show
                  when={!character.active}
                  fallback={<Button onClick={() => navigate('/character')}>Войти</Button>}
                >
                  <Button onClick={() => handleActivate(character.id)}>Сменить</Button>
                </Show>
              </div>
            )}
          </For>
        </div>

        <Show when={!showCreateForm()}>
          <div class="mt-4">
            <Button class="is-primary w-full" onClick={() => setShowCreateForm(true)}>
              Создать нового
            </Button>
          </div>
        </Show>
      </Card>

      <Show when={showCreateForm()}>
        <SelectCharacter onSelect={handleCreate} />

        <div class="mx-4 mb-4">
          <Button class="w-full" onClick={() => setShowCreateForm(false)}>
            Отмена
          </Button>
        </div>
      </Show>
    </Show>
  );
}
