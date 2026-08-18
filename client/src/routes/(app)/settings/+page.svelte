<script lang="ts">
  import type { NotificationType } from "@fwo/shared";
  import { themeParams, useSignal } from "@tma.js/sdk-svelte";
  import { invalidate } from "$app/navigation";
  import { client, createRequest } from "$lib/api";
  import { activateCharacter } from "$lib/character/utils/activate-character";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { popup } from "$lib/components/Popup/popup.svelte";
  import { characterClassNameMap } from "$lib/constants/character";
  import { getCharacterContext } from "$lib/constext/character";
  import { createRequestRunner } from "$lib/utils/create-request.svelte";
  import type { PageProps } from "./$types";

  const notificationTypes = [
    { key: "gameStart" as const, label: "Начало игры" },
    { key: "afkWarning" as const, label: "AFK" },
  ];

  const { data }: PageProps = $props();
  const character = getCharacterContext();
  const isDark = useSignal(themeParams.isDark);

  const isClanOwner = $derived(character().clan?.owner === character().id);

  const toggleNotification = createRequestRunner(
    async (type: NotificationType, enabled: boolean) => {
      await createRequest(client.character["notification-settings"].$patch)({
        json: { [type]: enabled },
      });
      await invalidate("app:character");
    },
  );

  const removeCharacter = createRequestRunner(async () => {
    await createRequest(client.character.$delete)({});
    window.location.reload();
  });

  const removeClan = createRequestRunner(async () => {
    await createRequest(client.clan.$delete)({});
    await invalidate("app:character");

    popup.info({ message: "Клан был удалён" });
  });

  const leaveClan = createRequestRunner(async () => {
    await createRequest(client.clan.leave.$post)({});
    await invalidate("app:clan");
    await invalidate("app:character");

    popup.info({ message: "Ты покинул клан" });
  });
</script>

<div class="h-full overflow-y-auto flex flex-col gap-4">
  <Card header="Уведомления">
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
              disabled={toggleNotification.pending}
              onchange={() => toggleNotification.run(key, !enabled)}
            />
            <span>{enabled ? "Вкл" : "Выкл"}</span>
          </label>
        </div>
      {/each}
    </div>
  </Card>

  {#if data.characters.length > 0}
    <Card header="Персонажи">
      <div class="flex flex-col gap-2 mb-4">
        {#each data.characters as char (char.id)}
          <div class="flex items-center justify-between">
            <div>
              <span class="font-semibold">{char.name}</span>
              <span class="text-sm opacity-50 ml-2">
                {characterClassNameMap[char.class]}
                {char.lvl} ур.
              </span>
            </div>
            <Button
              {@attach activateCharacter.attach(
                { disabled: () => !!char.active },
                char.id,
              )}
            >
              {char.active ? "Активен" : "Сменить"}
            </Button>
          </div>
        {/each}
      </div>
      <div class="flex flex-col gap-2">
        <Button class="is-primary" href="#/create">Создать нового</Button>
        <Button
          {@attach removeCharacter.attach({
            confirm: "Удалить персонажа? Персонаж будет удалён навсегда!",
          })}
          class="is-error"
        >
          Удалить текущего персонажа
        </Button>
      </div>
    </Card>
  {/if}

  {#if character().clan}
    <Card header="Управление аккаунтом">
      <div class="flex flex-col gap-2">
        {#if isClanOwner}
          <Button
            {@attach removeClan.attach({
              confirm: "Удалить клан? Клан будет удалён навсегда!",
            })}
          >
            Удалить клан
          </Button>
        {/if}
        {#if !isClanOwner}
          <Button {@attach leaveClan.attach({ confirm: "Выйти из клана?" })}>
            Покинуть клан
          </Button>
        {/if}
      </div>
    </Card>
  {/if}
</div>
