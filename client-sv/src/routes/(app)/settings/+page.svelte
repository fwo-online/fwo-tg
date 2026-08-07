<script lang="ts">
  import type { Character, NotificationType } from "@fwo/shared";
  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { client, createRequest } from "$lib/api";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { characterClassNameMap } from "$lib/constants/character";
  import { getCharacterContext } from "$lib/constext/character";
  import { getPopupContext } from "$lib/constext/popup";
  import { makeRequest } from "$lib/utils/make-request.svelte";

  const notificationTypes = [
    { key: "gameStart" as const, label: "Начало игры" },
    { key: "afkWarning" as const, label: "AFK" },
  ];

  const character = getCharacterContext();
  const popup = getPopupContext()();

  let loading = $state(false);
  let myCharacters = $state.raw<Character[]>([]);

  const isClanOwner = $derived(character().clan?.owner === character().id);

  onMount(async () => {
    try {
      myCharacters = await createRequest(client.character.my.$get)({});
    } catch {}
  });

  const toggleNotification = async (type: NotificationType, enabled: boolean) => {
    loading = true;
    await makeRequest(async () => {
      await createRequest(client.character["notification-settings"].$patch)({
        json: { [type]: enabled },
      });
      await invalidate("app:character");
    });
    loading = false;
  };

  const handleActivate = async (id: string) => {
    await makeRequest(async () => {
      await createRequest(client.character[':id'].activate.$patch)({ param: { id } });
      window.location.reload();
    });
  };

  const removeCharacter = () => {
    popup.confirm({
      title: "Удаление персонажа",
      message: "Персонаж будет удалён навсегда",
      onConfirm: async () => {
        await makeRequest(async () => {
          await createRequest(client.character.$delete)({});
          window.location.reload();
        });
      },
    });
  };

  const removeClan = () => {
    popup.confirm({
      title: "Удаление клана",
      message: "Клан будет удалён навсегда",
      onConfirm: async () => {
        await makeRequest(async () => {
          await createRequest(client.clan.$delete)({});
          await invalidate("app:character");
        });
        popup.info({ message: "Клан был удалён" });
      },
    });
  };

  const leaveClan = () => {
    popup.confirm({
      message: "Выход из клана",
      onConfirm: async () => {
        await makeRequest(async () => {
          await createRequest(client.clan.leave.$post)({});
          await invalidate("app:character");
        });
        popup.info({ message: "Ты покинул клан" });
      },
    });
  };
</script>

<Card header="Уведомления" class="m-4 mb-8">
  <div class="flex flex-col gap-2">
    {#each notificationTypes as { key, label } (key)}
      {@const enabled = character().notificationSettings?.[key] ?? false}
      <div class="flex items-center justify-between">
        <span>{label}</span>
        <Button
          class="p-0"
          disabled={loading}
          onclick={() => toggleNotification(key, !enabled)}
        >
          {enabled ? "Вкл" : "Выкл"}
        </Button>
      </div>
    {/each}
  </div>
</Card>

{#if myCharacters.length > 0}
  <Card header="Персонажи" class="m-4 mb-8">
    <div class="flex flex-col gap-2">
      {#each myCharacters as char (char.id)}
        <div class="flex items-center justify-between">
          <div>
            <span class="font-semibold">{char.name}</span>
            <span class="text-sm opacity-50 ml-2">
              {characterClassNameMap[char.class]} {char.lvl} ур.
            </span>
          </div>
          <Button disabled={char.active} onclick={() => handleActivate(char.id)}>
            {char.active ? "Активен" : "Сменить"}
          </Button>
        </div>
      {/each}
    </div>
    <div class="mt-4 flex flex-col gap-2">
      <Button class="is-primary" href="/create">
        Создать нового
      </Button>
      <Button class="is-error" onclick={removeCharacter}>
        Удалить текущего персонажа
      </Button>
    </div>
  </Card>
{/if}

{#if character().clan}
  <Card header="Управление аккаунтом" class="m-4">
    <div class="flex flex-col gap-2">
      {#if isClanOwner}
        <Button onclick={removeClan}>Удалить клан</Button>
      {/if}
      {#if !isClanOwner}
        <Button onclick={leaveClan}>Покинуть клан</Button>
      {/if}
    </div>
  </Card>
{/if}
