<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { client } from "$lib/api";
  import Button from "$lib/components/Button.svelte";
  import Card from "$lib/components/Card.svelte";
  import { getCharacterContext } from "$lib/constext/character";
  import type { NotificationType } from "@fwo/shared";

  const notificationTypes = [
    { key: "gameStart" as const, label: "Начало игры" },
    { key: "afkWarning" as const, label: "AFK" },
  ];

  const updateNotificationSettings = async (
    type: NotificationType,
    enabled: boolean,
  ) => {
    await client.character["notification-settings"].$patch({
      json: { [type]: enabled },
    });
    await invalidate("app:character");
  };

  const character = getCharacterContext();
</script>

<Card header="Уведомления" class="m-4 mb-8">
  <div class="flex flex-col gap-2">
    {#each notificationTypes as notificationType (notificationType.key)}
      <div class="flex items-center justify-between">
        <span>{notificationType.label}</span>
        <svelte:boundary>
          {@const enabled =
            character().notificationSettings?.[notificationType.key] ?? false}
          <Button
            class="p-0"
            disabled={!!$effect.pending()}
            onclick={() =>
              updateNotificationSettings(notificationType.key, !enabled)}
          >
            {enabled ? "Вкл" : "Выкл"}
          </Button>
        </svelte:boundary>
      </div>
    {/each}
  </div>
</Card>

<!-- <Card header="Управление аккаунтом" class="m-4">
  <div class="flex flex-col gap-2">
    <Button onClick={removeCharacter}>Удалить персонажа</Button>
    {#if isClanOwner}
      <Button onClick={removeClan}>Удалить клан</Button>
    {/if}
    {#if character.clan && !isClanOwner}
      <Button onClick={leaveClan}>Покинуть клан</Button>
    {/if}
  </div>
</Card> -->
