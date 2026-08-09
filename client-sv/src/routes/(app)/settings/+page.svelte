<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { client, createRequest } from "$lib/api";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { popup } from "$lib/components/Popup/popup.svelte";
  import { characterClassNameMap } from "$lib/constants/character";
  import { getCharacterContext } from "$lib/constext/character";
  import { makeRequest } from "$lib/utils/make-request.svelte";
  import type { Character, NotificationType } from "@fwo/shared";
  import { themeParams, useSignal } from "@tma.js/sdk-svelte";
  import { onMount } from "svelte";

  const notificationTypes = [
    { key: "gameStart" as const, label: "Начало игры" },
    { key: "afkWarning" as const, label: "AFK" },
  ];

  const character = getCharacterContext();
  const isDark = useSignal(themeParams.isDark);

  let loading = $state(false);
  let myCharacters = $state.raw<Character[]>([]);

  const isClanOwner = $derived(character().clan?.owner === character().id);

  onMount(async () => {
    try {
      myCharacters = await createRequest(client.character.my.$get)({});
    } catch {}
  });

  const toggleNotification = async (
    type: NotificationType,
    enabled: boolean,
  ) => {
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
      await createRequest(client.character[":id"].activate.$patch)({
        param: { id },
      });
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

<Card header="Уведомления" class="mb-8">
  <div class="flex flex-col gap-2">
    {#each notificationTypes as { key, label } (key)}
      {@const enabled = character().notificationSettings?.[key] ?? false}
      <div class="grid grid-cols-3">
        <span class="col-start-1 col-end-3">{label}</span>

        <label class="col-start-3">
          <input
            type="checkbox"
            class={["nes-checkbox", { "is-dark": isDark }]}
            checked={enabled}
            disabled={loading}
            onchange={() => toggleNotification(key, !enabled)}
          />
          <span>{enabled ? "Вкл" : "Выкл"}</span>
        </label>
      </div>
    {/each}
  </div>
</Card>

{#if myCharacters.length > 0}
  <Card header="Персонажи" class="mb-8">
    <div class="flex flex-col gap-2 mb-4">
      {#each myCharacters as char (char.id)}
        <div class="flex items-center justify-between">
          <div>
            <span class="font-semibold">{char.name}</span>
            <span class="text-sm opacity-50 ml-2">
              {characterClassNameMap[char.class]}
              {char.lvl} ур.
            </span>
          </div>
          <Button
            disabled={char.active}
            onclick={() => handleActivate(char.id)}
          >
            {char.active ? "Активен" : "Сменить"}
          </Button>
        </div>
      {/each}
    </div>
    <div class="flex flex-col gap-2">
      <Button class="is-primary" href="/create">Создать нового</Button>
      <Button class="is-error" onclick={removeCharacter}>
        Удалить текущего персонажа
      </Button>
    </div>
  </Card>
{/if}

{#if character().clan}
  <Card header="Управление аккаунтом">
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
