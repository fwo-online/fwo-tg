<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Card from "$lib/components/Card.svelte";
  import ClanPlayers from "./ClanPlayers.svelte";
  import type { CharacterPublic, Clan } from "@fwo/shared";
  import { client, createRequest } from "$lib/api";

  let {
    clan,
    requested = false,
    isLoading,
    onCreateRequest,
    onCancelRequest,
  }: {
    clan: Clan;
    requested?: boolean;
    isLoading: boolean;
    onCreateRequest: (id: string) => void;
    onCancelRequest: (id: string) => void;
  } = $props();

  let characters = $state.raw<CharacterPublic[]>([]);
  let isCharactersLoading = $state(false);

  const owner = $derived(
    characters?.filter(({ id }) => id === clan.owner) ?? [],
  );

  const handleOpenChange = async (open: boolean) => {
    if (open && !isCharactersLoading) {
      isCharactersLoading = true;
      try {
        characters = await createRequest(client.character.list.$get)({
          query: { ids: clan.players },
        });
      } finally {
        isCharactersLoading = false;
      }
    }
  };
</script>

<Modal onOpenChange={handleOpenChange}>
  {#snippet trigger()}
    <Button class="text-left">
      <div class="flex items-center justify-between">
        {clan.name}
        {#if requested}
          <span class="opacity-50">Ожидание</span>
        {/if}
      </div>
    </Button>
  {/snippet}

  <Card header={clan.name}>
    <div class="flex flex-col gap-2">
      <h5>Уровень {clan.lvl}</h5>
      <h5>Владелец</h5>
      {#if isCharactersLoading}
        Загружаем владельца...
      {:else}
        <ClanPlayers characters={owner} />
      {/if}

      <h5>Игроки</h5>
      {#if isCharactersLoading}
        Загружаем игроков...
      {:else}
        <ClanPlayers {characters} />
      {/if}

      <div class="flex mt-4">
        {#if requested}
          <Button
            class="is-primary flex-1"
            disabled={isLoading}
            onclick={() => onCancelRequest(clan.id)}
          >
            Отменить заявку
          </Button>
        {:else}
          <Button
            class="is-primary flex-1"
            disabled={isLoading}
            onclick={() => onCreateRequest(clan.id)}
          >
            Отправить заявку
          </Button>
        {/if}
      </div>
    </div>
  </Card>
</Modal>
